import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-card-md dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Self-service email reset is not available yet.
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Ask your <strong className="font-medium text-slate-800 dark:text-slate-200">workspace administrator</strong>{' '}
              or HR to reset your sign-in. They can update your account in the admin tools.
            </p>
            <p>
              If you can still sign in and only want to rotate your password, open{' '}
              <strong className="font-medium text-slate-800 dark:text-slate-200">Profile Settings</strong>{' '}
              and use the <strong className="font-medium text-slate-800 dark:text-slate-200">Security</strong> tab.
            </p>
          </div>

          <p className="mt-8 text-center text-sm">
            <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
