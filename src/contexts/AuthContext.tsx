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
  logoutClient,
  refreshClient,
  type TokenPair,
} from '../auth/authClient';
import {
  clearAllTokens,
  getClientRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
} from '../auth/tokenStore';
import { getAppConfig } from '../config';

interface LoginOptions {
  /** Override the tenant id resolved from env / TenantContext. */
  tenantId?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  /** Informational — set once the JWT comes back, cleared on logout. */
  tenantId: string | null;
  /** Non-null while a network request is in flight. */
  loading: boolean;
  /** Latest login/refresh error; cleared on a successful attempt. */
  error: string | null;
  switchRole: (role: UserRole) => void;
  login: (email: string, password: string, opts?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function defaultTenantId(): string | undefined {
  const v = getAppConfig().devTenantId;
  return v.length > 0 ? v : undefined;
}

/** User shape from JWT claims when no separate profile API has run yet. */
function userFromTokenPair(pair: TokenPair): User {
  return {
    id: pair.userId,
    tenantId: pair.tenantId ?? '',
    name: pair.email.split('@')[0],
    email: pair.email,
    role: 'employee',
    employeeId: '',
    department: '',
    designation: '',
    joiningDate: '',
  };
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('employee');
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyTokens = useCallback((pair: TokenPair) => {
    setClientAccessToken(pair.access);
    setClientRefreshToken(pair.refresh);
    const u = userFromTokenPair(pair);
    setUser(u);
    setRole(u.role);
    setTenantId(pair.tenantId ?? null);
    setError(null);
  }, []);

  // Silent-refresh on mount: if we have a persisted refresh token, try to
  // exchange it for a fresh access token so a reload keeps the session.
  useEffect(() => {
    const refresh = getClientRefreshToken();
    if (!refresh) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const pair = await refreshClient(refresh);
        if (!cancelled) applyTokens(pair);
      } catch {
        if (!cancelled) clearAllTokens();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyTokens]);

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
          // Map the common cases to friendlier copy.
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

  const logout = useCallback(async () => {
    const refresh = getClientRefreshToken();
    if (refresh) {
      try {
        await logoutClient(refresh);
      } catch {
        // Best-effort — we still clear local state below.
      }
    }
    clearAllTokens();
    setUser(null);
    setTenantId(null);
    setRole('employee');
    setError(null);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
    setUser((prev) => (prev ? { ...prev, role: newRole } : null));
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      isAuthenticated: !!user,
      tenantId,
      loading,
      error,
      switchRole,
      login,
      logout,
    }),
    [user, role, tenantId, loading, error, switchRole, login, logout]
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
