import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AppLogo from '../../components/brand/AppLogo';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageNotice from '../../components/common/PageNotice';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

import { focusFirstInvalidField } from './authFocus';

const CAPTCHA_LENGTH = 5;
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LOGIN_FIELD_ORDER = ['username', 'password', 'captcha'] as const;

type LoginField = (typeof LOGIN_FIELD_ORDER)[number];
type LoginErrors = Partial<Record<LoginField, string>>;

interface ValidationFocusRequest {
  commit: number;
  errors: LoginErrors;
}

const generateCaptcha = () => {
  let result = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error: authError } = useAuth();
  const { currentTenant, resolutionStatus, resolutionError } = useTenant();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [errors, setErrors] = useState<LoginErrors>({});
  const [validationFocus, setValidationFocus] = useState<ValidationFocusRequest>({
    commit: 0,
    errors: {},
  });
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<HTMLInputElement>(null);

  const submitting = loading;
  const [passwordChangedNotice] = useState(
    () => (location.state as { passwordChanged?: boolean } | null)?.passwordChanged === true
  );

  useEffect(() => {
    if (!passwordChangedNotice) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, navigate, passwordChangedNotice]);

  useEffect(() => {
    if (validationFocus.commit === 0) return;
    focusFirstInvalidField(validationFocus.errors, LOGIN_FIELD_ORDER, {
      username: usernameRef,
      password: passwordRef,
      captcha: captchaRef,
    });
  }, [validationFocus]);

  const refreshCaptcha = useCallback((clearCaptchaError = true) => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    if (clearCaptchaError) {
      setErrors((e) => ({ ...e, captcha: undefined }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: LoginErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    const captchaNormalized = captchaInput.trim().toUpperCase();
    if (captchaNormalized !== captchaCode) {
      newErrors.captcha = 'Captcha verification failed. Please try again.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setValidationFocus((previous) => ({
        commit: previous.commit + 1,
        errors: newErrors,
      }));
      if (newErrors.captcha) {
        refreshCaptcha(false);
      }
      return;
    }

    setErrors({});

    try {
      await login(username.trim(), password, { tenantId: currentTenant.id });
      navigate('/dashboard', { replace: true });
    } catch {
      // AuthContext already populated `authError`; we just rotate the captcha
      // to defeat a naive password-spray.
      refreshCaptcha();
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-card-md dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="mb-8 text-center">
            <AppLogo size="lg" className="justify-center" />
            <h1 className="mt-5 text-balance text-2xl font-semibold text-content-primary">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to {currentTenant.id ? currentTenant.name : 'your organization'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {passwordChangedNotice && (
              <div
                role="status"
                className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-700/60 dark:bg-green-900/30 dark:text-green-100"
              >
                Password changed successfully. Sign in with your new password.
              </div>
            )}
            <Input
              ref={usernameRef}
              label="Email, mobile number, or unique name"
              name="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((err) => ({ ...err, username: undefined }));
              }}
              placeholder="Email, mobile number, or unique name"
              error={errors.username}
              fullWidth
              autoComplete="username"
              spellCheck={false}
            />

            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                ref={passwordRef}
                id="login-password"
                aria-label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((err) => ({ ...err, password: undefined }));
                }}
                placeholder="Enter your password"
                error={errors.password}
                fullWidth
                autoComplete="current-password"
              />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Captcha verification
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700"
                  aria-hidden
                >
                  <span
                    className="select-none text-xl font-bold tracking-[0.4em] text-gray-700 dark:text-gray-200"
                    style={{
                      letterSpacing: '0.35em',
                      fontFamily: 'monospace',
                    }}
                  >
                    {captchaCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => refreshCaptcha()}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  title="Refresh Captcha"
                  aria-label="Refresh verification code"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
              <Input
                ref={captchaRef}
                label="Verification code"
                name="verificationCode"
                type="text"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value.toUpperCase());
                  setErrors((err) => ({ ...err, captcha: undefined }));
                }}
                placeholder="Enter the code above"
                error={errors.captcha}
                fullWidth
                className="mt-2"
                maxLength={CAPTCHA_LENGTH}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {resolutionStatus === 'not-found' && (
              <div
                role="alert"
                className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-100"
              >
                {resolutionError ?? 'We could not find this organization.'}
              </div>
            )}

            {authError && (
              <PageNotice key={authError} variant="error" title="Unable to sign in" focusOnMount>
                {authError}
              </PageNotice>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={submitting || !currentTenant.id || resolutionStatus !== 'resolved'}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
