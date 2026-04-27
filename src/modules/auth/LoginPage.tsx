import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [errors, setErrors] = useState<{ email?: string; password?: string; captcha?: string }>({});

  const submitting = loading;

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    setErrors((e) => ({ ...e, captcha: undefined }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string; captcha?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
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
        refreshCaptcha();
      }
      return;
    }

    setErrors({});

    try {
      await login(email.trim(), password);
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
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              KabiPay
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((err) => ({ ...err, email: undefined }));
              }}
              placeholder="e.g. john.doe@techcorp.com"
              error={errors.email}
              fullWidth
              autoComplete="email"
            />

            <Input
              label="Password"
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
                  onClick={refreshCaptcha}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  title="Refresh captcha"
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

            {authError && (
              <div
                role="alert"
                className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700/60 dark:bg-red-900/30 dark:text-red-200"
              >
                {authError}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Seed credentials: <code>demo@kabipay.local</code> / <code>ChangeMe!123</code>
            {' — see scripts/seed-demo-data.ps1.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
