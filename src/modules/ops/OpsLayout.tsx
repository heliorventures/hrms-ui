import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { APP_BRAND } from '@/constants/brand';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ');

const OpsLayout = () => {
  const { opsUser, logoutOps } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logoutOps();
    navigate('/ops/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            {APP_BRAND.productName}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Operator console</p>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          <NavLink to="/ops/tenants" className={navLinkClass}>
            Tenants
          </NavLink>
          <NavLink to="/ops/modules" className={navLinkClass}>
            Modules &amp; subscriptions
          </NavLink>
          <NavLink to="/ops/billing" className={navLinkClass}>
            Billing
          </NavLink>
          <NavLink to="/ops/operators" className={navLinkClass}>
            Operator users
          </NavLink>
          <NavLink to="/ops/feature-flags" className={navLinkClass}>
            Feature flags
          </NavLink>
        </nav>
        <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p className="truncate font-medium text-slate-700 dark:text-slate-200">
            {opsUser?.email ?? '—'}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 text-left text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <NavLink
            to="/dashboard"
            className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            ← Back to employee app
          </NavLink>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OpsLayout;
