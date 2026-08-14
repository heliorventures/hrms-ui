import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { APP_BRAND } from '../../constants/brand';
import AppLogo from '../../components/brand/AppLogo';

const CAPTCHA_LENGTH = 5;
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateCaptcha = () => {
  let result = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();
  const { currentTenant, resolutionStatus, resolutionError } = useTenant();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [errors, setErrors] = useState<{ username?: string; password?: string; captcha?: string }>({});

  const submitting = loading;

  const refreshCaptcha = useCallback((clearCaptchaError = true) => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    if (clearCaptchaError) {
      setErrors((e) => ({ ...e, captcha: undefined }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { username?: string; password?: string; captcha?: string } = {};

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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-card-md dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="mb-8 text-center">
            <AppLogo size="lg" className="justify-center" />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to {currentTenant.id ? currentTenant.name : 'your organization'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
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
                id="login-password"
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Captcha verification
              </label>
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
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div
                role="alert"
                className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700/60 dark:bg-red-900/30 dark:text-red-200"
              >
                {authError}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={submitting || !currentTenant.id || resolutionStatus !== 'resolved'}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
