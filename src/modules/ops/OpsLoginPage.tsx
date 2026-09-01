import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AppLogo from '@/components/brand/AppLogo';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import PageNotice from '@/components/common/PageNotice';
import { APP_BRAND } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { focusFirstInvalidField } from '@/modules/auth/authFocus';

const CAPTCHA_LENGTH = 5;
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const OPS_LOGIN_FIELD_ORDER = ['email', 'password', 'captcha'] as const;

type OpsLoginField = (typeof OPS_LOGIN_FIELD_ORDER)[number];
type OpsLoginErrors = Partial<Record<OpsLoginField, string>>;

interface ValidationFocusRequest {
  commit: number;
  errors: OpsLoginErrors;
}

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
  const [errors, setErrors] = useState<OpsLoginErrors>({});
  const [validationFocus, setValidationFocus] = useState<ValidationFocusRequest>({
    commit: 0,
    errors: {},
  });
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (validationFocus.commit === 0) return;
    focusFirstInvalidField(validationFocus.errors, OPS_LOGIN_FIELD_ORDER, {
      email: emailRef,
      password: passwordRef,
      captcha: captchaRef,
    });
  }, [validationFocus]);

  const refreshCaptcha = useCallback((clearCaptchaError = true) => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    if (clearCaptchaError) {
      setErrors((prev) => ({ ...prev, captcha: undefined }));
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: OpsLoginErrors = {};
    if (!email.trim()) nextErrors.email = 'Email is required';
    if (!password) nextErrors.password = 'Password is required';
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      nextErrors.captcha = 'Captcha verification failed. Please try again.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setValidationFocus((previous) => ({
        commit: previous.commit + 1,
        errors: nextErrors,
      }));
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-200/90 bg-white p-8 shadow-card-md dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="mb-8 text-center">
            <AppLogo size="lg" supportingText="Operator console" className="justify-center" />
            <h1 className="mt-5 text-balance text-2xl font-semibold text-content-primary">
              Operator Sign In
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Platform sign-in for {APP_BRAND.productName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              ref={emailRef}
              label="Email"
              name="email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="ops-admin@heliorhrms.local"
              error={errors.email}
              fullWidth
              autoComplete="username"
              spellCheck={false}
            />

            <Input
              ref={passwordRef}
              label="Password"
              name="password"
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
              <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Captcha verification
              </p>
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
                  aria-label="Refresh verification code"
                >
                  Refresh
                </button>
              </div>
              <Input
                ref={captchaRef}
                label="Verification code"
                name="verificationCode"
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
                spellCheck={false}
              />
            </div>

            {opsError ? (
              <PageNotice key={opsError} variant="error" title="Unable to sign in" focusOnMount>
                {opsError}
              </PageNotice>
            ) : null}

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to console'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link to="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Back to {APP_BRAND.productName}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default OpsLoginPage;
