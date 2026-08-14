import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import AppLogo from '@/components/brand/AppLogo';
import { APP_BRAND } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';

const CAPTCHA_LENGTH = 5;
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateCaptcha = () => {
  let result = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i += 1) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
};

const OpsLoginPage = () => {
  const navigate = useNavigate();
  const { loginOps, loading, opsError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [errors, setErrors] = useState<{ email?: string; password?: string; captcha?: string }>({});

  const refreshCaptcha = useCallback((clearCaptchaError = true) => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    if (clearCaptchaError) {
      setErrors((prev) => ({ ...prev, captcha: undefined }));
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string; captcha?: string } = {};
    if (!email.trim()) nextErrors.email = 'Email is required';
    if (!password) nextErrors.password = 'Password is required';
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      nextErrors.captcha = 'Captcha verification failed. Please try again.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.captcha) refreshCaptcha(false);
      return;
    }

    setErrors({});
    try {
      await loginOps(email.trim(), password);
      navigate('/ops/tenants', { replace: true });
    } catch {
      refreshCaptcha();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-200/90 bg-white p-8 shadow-card-md dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="mb-8 text-center">
            <AppLogo size="lg" supportingText="Operator console" className="justify-center" />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Platform sign-in for {APP_BRAND.productName}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="ops-admin@heliorhrms.local"
              error={errors.email}
              fullWidth
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Password"
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
                  <span className="select-none font-mono text-xl font-bold tracking-widest text-gray-700 dark:text-gray-200">
                    {captchaCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => refreshCaptcha()}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  title="Refresh Captcha"
                >
                  Refresh
                </button>
              </div>
              <Input
                type="text"
                value={captchaInput}
                onChange={(event) => {
                  setCaptchaInput(event.target.value.toUpperCase());
                  setErrors((prev) => ({ ...prev, captcha: undefined }));
                }}
                placeholder="Enter the code above"
                error={errors.captcha}
                fullWidth
                className="mt-2"
                maxLength={CAPTCHA_LENGTH}
                autoComplete="off"
              />
            </div>

            {opsError ? (
              <div
                role="alert"
                className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700/60 dark:bg-red-900/30 dark:text-red-200"
              >
                {opsError}
              </div>
            ) : null}

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in to console'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link
              to="/"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Back to {APP_BRAND.productName}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpsLoginPage;
