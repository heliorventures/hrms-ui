import { Link } from 'react-router-dom';

import { APP_BRAND } from '../../constants/brand';
import { useTenant } from '../../contexts/TenantContext';

const ForgotPasswordPage = () => {
  const { currentTenant } = useTenant();
  const organizationName = currentTenant.name.trim() || APP_BRAND.productName;

  return (
    <main
      aria-labelledby="password-help-title"
      className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 dark:bg-slate-950 sm:px-6"
    >
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-card-md dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="mb-6 text-center">
            <h1
              id="password-help-title"
              className="text-pretty text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Password Help
            </h1>
            <p className="mt-2 break-words text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {organizationName}
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>Your administrator or HR team can reset your sign-in password.</p>
            <p>Contact them for help regaining access to your account.</p>
          </div>

          <p className="mt-8 text-center text-sm">
            <Link
              to="/login"
              className="rounded-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-indigo-400 dark:hover:text-indigo-300 dark:focus-visible:ring-offset-slate-900"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
