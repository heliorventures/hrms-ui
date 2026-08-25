import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

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
import { authUserMessage } from '../auth/authUserMessage';
import {
  parseClientAccessToken,
  personaToLegacyUserRole,
  type ClientPersona,
  type ParsedClientSession,
} from '../auth/clientSession';
import { endExpiredClientSession, endExpiredOperatorSession } from '../auth/sessionExpiry';
import {
  claimClientSessionBootstrap,
  refreshTokenTenantId,
  sessionMatchesTenant,
} from '../auth/tenantSession';
import {
  clearClientSession,
  clearLegacyClientRefreshToken,
  clearOperatorSession,
  getClientRefreshToken,
  getOperatorRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
  setOperatorAccessToken,
  setOperatorRefreshToken,
} from '../auth/tokenStore';
import { getAppConfig } from '../config';
import type { User, UserRole } from '../types';
import { graphQlUserMessage } from '../utils/graphqlUserMessage';

import { useTenant } from './TenantContext';

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
  permissionScopes: {},
  resourceScopes: {},
  employeeId: undefined,
  persona: 'EMPLOYEE',
  mustChangePassword: false,
});

const CLIENT_REFRESH_LEEWAY_MS = 60_000;
const CLIENT_REFRESH_ON_RESUME_MS = 2 * 60_000;

interface AuthContextType {
  user: User | null;
  opsUser: OpsUser | null;
  /** Legacy UI role: `admin` when JWT maps to tenant admin **or** HR persona. */
  role: UserRole;
  /** JWT-derived persona (from role names on token) — display / dev switch only; gates use `can()`. */
  persona: ClientPersona;
  /** Permission from current client access token (`resource:action`). */
  can: (permission: string) => boolean;
  canAny: (permissions: readonly string[]) => boolean;
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
  login: (username: string, password: string, opts?: LoginOptions) => Promise<void>;
  loginOps: (email: string, password: string) => Promise<void>;
  expireClientSession: () => void;
  expireOpsSession: () => void;
  logout: () => Promise<void>;
  logoutOps: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function defaultTenantId(): string | undefined {
  if (import.meta.env.DEV !== true) return undefined;
  const v = getAppConfig().devTenantId;
  return v && v.length > 0 ? v : undefined;
}

function devRoleSwitchEnabled(): boolean {
  return import.meta.env.DEV === true && import.meta.env.VITE_ENABLE_DEV_ROLE_SWITCH === 'true';
}

/** User shape from client JWT claims when no separate profile API has run yet. */
function userFromClientTokenPair(pair: TokenPair, role: UserRole, employeeId?: string): User {
  const displayName = pair.username ?? pair.email;
  return {
    id: pair.userId,
    tenantId: pair.tenantId ?? '',
    name: displayName.split('@')[0],
    email: pair.email,
    role,
    employeeId: employeeId ?? '',
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
  const { currentTenant, resolutionStatus } = useTenant();
  const [user, setUser] = useState<User | null>(null);
  const [opsUser, setOpsUser] = useState<OpsUser | null>(null);
  const [role, setRole] = useState<UserRole>('employee');
  const [clientSession, setClientSession] = useState<ParsedClientSession | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientBootstrapPending, setClientBootstrapPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opsError, setOpsError] = useState<string | null>(null);
  const clientRefreshPromiseRef = useRef<{ tenantId: string; promise: Promise<boolean> } | null>(
    null
  );
  const clientBootstrapTenantRef = useRef<string | null>(null);

  const persona = clientSession?.persona ?? 'EMPLOYEE';
  const can = useCallback(
    (permission: string) => clientSession?.permissions.has(permission) ?? false,
    [clientSession]
  );

  const canAny = useCallback(
    (permissions: readonly string[]) => permissions.some((p) => can(p)),
    [can]
  );

  const applyTokens = useCallback((pair: TokenPair, expectedTenantId: string) => {
    if (!sessionMatchesTenant(pair.tenantId, expectedTenantId)) {
      clearClientSession(expectedTenantId);
      throw new Error('tenant session mismatch');
    }
    setClientAccessToken(pair.access);
    setClientRefreshToken(expectedTenantId, pair.refresh);
    const session = parseClientAccessToken(pair.access) ?? emptySession();
    setClientSession(session);
    const legacyRole = personaToLegacyUserRole(session.persona);
    const u = userFromClientTokenPair(pair, legacyRole, session.employeeId);
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

  const clearClientState = useCallback(
    (tenantToClear: string | null = tenantId) => {
      clearClientSession(tenantToClear);
      setUser(null);
      setTenantId(null);
      setRole('employee');
      setClientSession(null);
    },
    [tenantId]
  );

  const refreshClientSession = useCallback(
    async (expectedTenantId: string): Promise<boolean> => {
      const refresh = getClientRefreshToken(expectedTenantId);
      if (!refresh) return false;
      if (!sessionMatchesTenant(refreshTokenTenantId(refresh), expectedTenantId)) {
        clearClientState(expectedTenantId);
        return false;
      }
      if (clientRefreshPromiseRef.current?.tenantId === expectedTenantId) {
        return clientRefreshPromiseRef.current.promise;
      }

      const refreshAttempt = (async () => {
        try {
          const pair = await refreshClient(refresh);
          if (getClientRefreshToken(expectedTenantId) === refresh) {
            applyTokens(pair, expectedTenantId);
          }
          return true;
        } catch (e) {
          if (
            getClientRefreshToken(expectedTenantId) === refresh &&
            e instanceof AuthError &&
            (e.status === 401 || e.status === 403)
          ) {
            clearClientState(expectedTenantId);
            setError(graphQlUserMessage(e));
          }
          return false;
        }
      })();

      clientRefreshPromiseRef.current = { tenantId: expectedTenantId, promise: refreshAttempt };
      try {
        return await refreshAttempt;
      } finally {
        if (clientRefreshPromiseRef.current.promise === refreshAttempt) {
          clientRefreshPromiseRef.current = null;
        }
      }
    },
    [applyTokens, clearClientState]
  );

  // Claiming the resolved tenant keeps StrictMode or later auth-state effect replays from
  // re-running bootstrap work. Tenant-keyed refresh tokens are restored only when they match the
  // resolved workspace, so a stale token from another tenant cannot leak into this tenant.
  useEffect(() => {
    if (resolutionStatus !== 'resolved' || !currentTenant.id) {
      setClientBootstrapPending(resolutionStatus === 'resolving');
      return;
    }
    if (!claimClientSessionBootstrap(clientBootstrapTenantRef, currentTenant.id)) {
      setClientBootstrapPending(false);
      return;
    }

    clearLegacyClientRefreshToken();
    let cancelled = false;
    setClientBootstrapPending(true);
    void refreshClientSession(currentTenant.id).finally(() => {
      if (!cancelled) setClientBootstrapPending(false);
    });
    return () => {
      cancelled = true;
    };
  }, [currentTenant.id, refreshClientSession, resolutionStatus]);

  // Operator sessions restore independently of tenant resolution.
  useEffect(() => {
    const operatorRefresh = getOperatorRefreshToken();
    if (!operatorRefresh) return;

    const controller = new AbortController();
    setLoading(true);
    void refreshOps(operatorRefresh)
      .then((pair) => {
        if (!controller.signal.aborted) applyOpsTokens(pair);
      })
      .catch(() => {
        if (!controller.signal.aborted) clearOperatorSession();
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [applyOpsTokens]);

  useEffect(() => {
    if (
      !user ||
      !tenantId ||
      !clientSession?.expiresAtMs ||
      !sessionMatchesTenant(tenantId, currentTenant.id) ||
      !getClientRefreshToken(tenantId)
    ) {
      return;
    }
    const delay = Math.max(
      5_000,
      clientSession.expiresAtMs - Date.now() - CLIENT_REFRESH_LEEWAY_MS
    );
    const timer = window.setTimeout(() => {
      void refreshClientSession(tenantId);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [clientSession?.expiresAtMs, currentTenant.id, refreshClientSession, tenantId, user]);

  useEffect(() => {
    if (!user || !tenantId || !sessionMatchesTenant(tenantId, currentTenant.id)) return;
    const maybeRefresh = () => {
      if (!clientSession?.expiresAtMs || !getClientRefreshToken(tenantId)) return;
      if (clientSession.expiresAtMs - Date.now() <= CLIENT_REFRESH_ON_RESUME_MS) {
        void refreshClientSession(tenantId);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') maybeRefresh();
    };
    window.addEventListener('focus', maybeRefresh);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', maybeRefresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [clientSession?.expiresAtMs, currentTenant.id, refreshClientSession, tenantId, user]);

  const login = useCallback(
    async (username: string, password: string, opts: LoginOptions = {}) => {
      setError(null);

      const tenant = opts.tenantId ?? (currentTenant.id || defaultTenantId());
      if (!tenant) {
        setError('Open your organization sign-in link before logging in.');
        throw new Error('missing tenantId');
      }
      setLoading(true);
      try {
        const pair = await loginClient(username.trim(), password, tenant);
        applyTokens(pair, tenant);
      } catch (e) {
        setError(authUserMessage(e, 'tenant-login'));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [applyTokens, currentTenant.id]
  );

  const loginOpsHandler = useCallback(
    async (email: string, password: string) => {
      setOpsError(null);
      setLoading(true);
      try {
        const pair = await loginOps(email.trim(), password);
        applyOpsTokens(pair);
      } catch (e) {
        setOpsError(authUserMessage(e, 'operator-login'));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [applyOpsTokens]
  );

  const expireClientSession = useCallback(() => {
    endExpiredClientSession(tenantId, clearClientState, setError);
  }, [clearClientState, tenantId]);

  const expireOpsSession = useCallback(() => {
    endExpiredOperatorSession(() => {
      clearOperatorSession();
      setOpsUser(null);
    }, setOpsError);
  }, []);

  const logout = useCallback(async () => {
    const authenticatedTenantId = tenantId;
    const refresh = authenticatedTenantId ? getClientRefreshToken(authenticatedTenantId) : null;
    if (refresh) {
      try {
        await logoutClient(refresh);
      } catch {
        // Best-effort — we still clear local state below.
      }
    }
    clearClientState(authenticatedTenantId);
    setError(null);
  }, [clearClientState, tenantId]);

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
      can,
      canAny,
      clientSession,
      isAuthenticated: !!user,
      isOpsAuthenticated: !!opsUser,
      tenantId,
      loading: loading || clientBootstrapPending,
      error,
      opsError,
      switchRole,
      login,
      loginOps: loginOpsHandler,
      expireClientSession,
      expireOpsSession,
      logout,
      logoutOps,
    }),
    [
      user,
      opsUser,
      role,
      persona,
      can,
      canAny,
      clientSession,
      tenantId,
      loading,
      clientBootstrapPending,
      error,
      opsError,
      switchRole,
      login,
      loginOpsHandler,
      expireClientSession,
      expireOpsSession,
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
