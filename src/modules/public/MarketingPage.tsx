import { Link } from 'react-router-dom';
import { APP_BRAND } from '../../constants/brand';

const FEATURE_LABELS = [
  'People operations',
  'Attendance and timesheets',
  'Leave and expenses',
  'Payroll readiness',
] as const;

const MarketingPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
            {APP_BRAND.platformName}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Run HR, payroll, time, and employee operations from one workspace.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {APP_BRAND.tagline}. Use your organization sign-in link to access your secure tenant
            workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {FEATURE_LABELS.map((label) => (
              <span
                key={label}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/ops/login"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Platform sign in
            </Link>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Tenant users should open their company-specific HeliorHRMS URL.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MarketingPage;
