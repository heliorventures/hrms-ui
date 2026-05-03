import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { User, UserRole } from '../types';
import {
  AuthError,
  loginClient,
  loginOps,
  logoutClient,
  logoutOps as revokeOpsSession,
  refreshClient,
  refreshOps,
  type TokenPair,
} from '../auth/authClient';
import {
  parseClientAccessToken,
  personaToLegacyUserRole,
  deriveShowHrNav,
  deriveShowTenantAdminNav,
  type ClientPersona,
  type ParsedClientSession,
} from '../auth/clientSession';
import {
  clearClientSession,
  clearOperatorSession,
  getClientRefreshToken,
  getOperatorRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
  setOperatorAccessToken,
  setOperatorRefreshToken,
} from '../auth/tokenStore';
import { getAppConfig } from '../config';

export interface OpsUser {
  id: string;
  email: string;
  name: string;
}

interface LoginOptions {
  /** Override the tenant id resolved from env / TenantContext. */
  tenantId?: string;
}

const emptySession = (): ParsedClientSession => ({
  jwtRoles: [],
  permissions: new Set(),
  resourceScopes: {},
  persona: 'EMPLOYEE',
});

interface AuthContextType {
  user: User | null;
  opsUser: OpsUser | null;
  /** Legacy UI role: `admin` when JWT maps to tenant admin **or** HR persona. */
  role: UserRole;
  /** JWT-derived persona: tenant admin, HR workbench, or employee. */
  persona: ClientPersona;
  /** Configuration / ops-style **Admin** sidebar (`/admin/*`). */
  showTenantAdminNav: boolean;
  /** **HR** workbench sidebar (`/hr/*`). */
  showHrNav: boolean;
  /** True when JWT maps to `ADMIN` | `HR` persona (not plain employee). */
  isElevated: boolean;
  /** Permission from current client access token (`resource:action`). */
  can: (permission: string) => boolean;
  canAny: (permissions: readonly string[]) => boolean;
  hasJwtRole: (roleName: string) => boolean;
  hasAnyJwtRole: (roleNames: readonly string[]) => boolean;
  /** Parsed client session from JWT; empty when logged out. */
  clientSession: ParsedClientSession | null;
  /** Tenant (employee) app session. */
  isAuthenticated: boolean;
  /** Operator console session (platform / kabipay-ops JWT). */
  isOpsAuthenticated: boolean;
  /** Informational — set once the client JWT comes back, cleared on client logout. */
  tenantId: string | null;
  /** Non-null while a network request is in flight (login or silent refresh). */
  loading: boolean;
  /** Latest client login/refresh error; cleared on a successful client attempt. */
  error: string | null;
  /** Latest operator login/refresh error; cleared on a successful operator attempt. */
  opsError: string | null;
  /**
   * Insecure dev-only UI toggle; does not change the JWT.
   * Enable with `VITE_ENABLE_DEV_ROLE_SWITCH=true` in dev.
   */
  switchRole: (role: UserRole) => void;
  login: (email: string, password: string, opts?: LoginOptions) => Promise<void>;
  loginOps: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutOps: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function defaultTenantId(): string | undefined {
  const v = getAppConfig().devTenantId;
  return v.length > 0 ? v : undefined;
}

function devRoleSwitchEnabled(): boolean {
  return import.meta.env.DEV === true && import.meta.env.VITE_ENABLE_DEV_ROLE_SWITCH === 'true';
}

/** User shape from client JWT claims when no separate profile API has run yet. */
function userFromClientTokenPair(pair: TokenPair, role: UserRole): User {
  return {
    id: pair.userId,
    tenantId: pair.tenantId ?? '',
    name: ((pair.email ?? '') as string).split('@')[0],
    email: pair.email,
    role,
    employeeId: '',
    department: '',
    designation: '',
    joiningDate: '',
  };
}

function opsUserFromTokenPair(pair: TokenPair): OpsUser {
  return {
    id: pair.userId,
    email: pair.email,
    name: pair.email.split('@')[0],
  };
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [opsUser, setOpsUser] = useState<OpsUser | null>(null);
  const [role, setRole] = useState<UserRole>('employee');
  const [clientSession, setClientSession] = useState<ParsedClientSession | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opsError, setOpsError] = useState<string | null>(null);

  const persona = clientSession?.persona ?? 'EMPLOYEE';
  const showTenantAdminNav = clientSession
    ? deriveShowTenantAdminNav(clientSession.jwtRoles)
    : false;
  const showHrNav = clientSession ? deriveShowHrNav(clientSession.jwtRoles) : false;
  /** Nav / route gates: follows `user.role` (JWT by default; dev switch may override locally). */
  const isElevated = user != null && user.role !== 'employee';

  const can = useCallback(
    (permission: string) => clientSession?.permissions.has(permission) ?? false,
    [clientSession]
  );

  const canAny = useCallback(
    (permissions: readonly string[]) => permissions.some((p) => can(p)),
    [can]
  );

  const hasJwtRole = useCallback(
    (roleName: string) => {
      const u = roleName.trim().toUpperCase();
      return clientSession?.jwtRoles.some((r) => r.trim().toUpperCase() === u) ?? false;
    },
    [clientSession]
  );

  const hasAnyJwtRole = useCallback(
    (roleNames: readonly string[]) => roleNames.some((n) => hasJwtRole(n)),
    [hasJwtRole]
  );

  const applyTokens = useCallback((pair: TokenPair) => {
    setClientAccessToken(pair.access);
    setClientRefreshToken(pair.refresh);
    const session = parseClientAccessToken(pair.access) ?? emptySession();
    setClientSession(session);
    const legacyRole = personaToLegacyUserRole(session.persona);
    const u = userFromClientTokenPair(pair, legacyRole);
    setUser(u);
    setRole(legacyRole);
    setTenantId(pair.tenantId ?? null);
    setError(null);
  }, []);

  const applyOpsTokens = useCallback((pair: TokenPair) => {
    setOperatorAccessToken(pair.access);
    setOperatorRefreshToken(pair.refresh);
    setOpsUser(opsUserFromTokenPair(pair));
    setOpsError(null);
  }, []);

  // Silent refresh on mount: restore client and/or operator sessions independently.
  useEffect(() => {
    const clientRefresh = getClientRefreshToken();
    const operatorRefresh = getOperatorRefreshToken();
    if (!clientRefresh && !operatorRefresh) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await Promise.all([
          (async () => {
            if (!clientRefresh) return;
            try {
              const pair = await refreshClient(clientRefresh);
              if (!cancelled) applyTokens(pair);
            } catch {
              if (!cancelled) clearClientSession();
            }
          })(),
          (async () => {
            if (!operatorRefresh) return;
            try {
              const pair = await refreshOps(operatorRefresh);
              if (!cancelled) applyOpsTokens(pair);
            } catch {
              if (!cancelled) clearOperatorSession();
            }
          })(),
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyTokens, applyOpsTokens]);

  const login = useCallback(
    async (email: string, password: string, opts: LoginOptions = {}) => {
      setError(null);

      const tenant = opts.tenantId ?? defaultTenantId();
      if (!tenant) {
        setError('No tenant configured. Set devTenantId in public/config.json or pass tenantId.');
        throw new Error('missing tenantId');
      }
      setLoading(true);
      try {
        const pair = await loginClient(email.trim(), password, tenant);
        applyTokens(pair);
      } catch (e) {
        if (e instanceof AuthError) {
          const friendly =
            e.code === 'UNAUTHENTICATED' ? 'Email or password is incorrect.' : e.message;
          setError(friendly);
        } else if (e instanceof TypeError) {
          setError(
            `Cannot reach auth service. Is kabipay-auth running on ${getAppConfig().authUrl}?`
          );
        } else {
          setError('Login failed. Please try again.');
        }
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [applyTokens]
  );

  const loginOpsHandler = useCallback(
    async (email: string, password: string) => {
      setOpsError(null);
      setLoading(true);
      try {
        const pair = await loginOps(email.trim(), password);
        applyOpsTokens(pair);
      } catch (e) {
        if (e instanceof AuthError) {
          const friendly =
            e.code === 'UNAUTHENTICATED' ? 'Email or password is incorrect.' : e.message;
          setOpsError(friendly);
        } else if (e instanceof TypeError) {
          setOpsError(
            `Cannot reach auth service. Is kabipay-auth running on ${getAppConfig().authUrl}?`
          );
        } else {
          setOpsError('Login failed. Please try again.');
        }
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [applyOpsTokens]
  );

  const logout = useCallback(async () => {
    const refresh = getClientRefreshToken();
    if (refresh) {
      try {
        await logoutClient(refresh);
      } catch {
        // Best-effort — we still clear local state below.
      }
    }
    clearClientSession();
    setUser(null);
    setTenantId(null);
    setRole('employee');
    setClientSession(null);
    setError(null);
  }, []);

  const logoutOps = useCallback(async () => {
    const refresh = getOperatorRefreshToken();
    if (refresh) {
      try {
        await revokeOpsSession(refresh);
      } catch {
        // Best-effort
      }
    }
    clearOperatorSession();
    setOpsUser(null);
    setOpsError(null);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    if (!devRoleSwitchEnabled()) return;
    setRole(newRole);
    setUser((prev) => (prev ? { ...prev, role: newRole } : null));
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      opsUser,
      role,
      persona,
      showTenantAdminNav,
      showHrNav,
      isElevated,
      can,
      canAny,
      hasJwtRole,
      hasAnyJwtRole,
      clientSession,
      isAuthenticated: !!user,
      isOpsAuthenticated: !!opsUser,
      tenantId,
      loading,
      error,
      opsError,
      switchRole,
      login,
      loginOps: loginOpsHandler,
      logout,
      logoutOps,
    }),
    [
      user,
      opsUser,
      role,
      persona,
      showTenantAdminNav,
      showHrNav,
      isElevated,
      can,
      canAny,
      hasJwtRole,
      hasAnyJwtRole,
      clientSession,
      tenantId,
      loading,
      error,
      opsError,
      switchRole,
      login,
      loginOpsHandler,
      logout,
      logoutOps,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
