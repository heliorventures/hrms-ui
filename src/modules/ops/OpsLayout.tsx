import { useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import Drawer from '@/components/common/Drawer';
import IconButton from '@/components/common/IconButton';
import { APP_BRAND } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';

const OPERATOR_NAVIGATION = [
  { label: 'Tenants', path: '/ops/tenants' },
  { label: 'Modules & subscriptions', path: '/ops/modules' },
  { label: 'Billing', path: '/ops/billing' },
  { label: 'Operator users', path: '/ops/operators' },
  { label: 'Feature flags', path: '/ops/feature-flags' },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  ].join(' ');

interface OperatorNavigationProps {
  ariaLabel: string;
  email: string;
  onNavigate?: () => void;
  onSignOut: () => void;
}

const OperatorNavigation = ({
  ariaLabel,
  email,
  onNavigate,
  onSignOut,
}: OperatorNavigationProps) => (
  <div className="flex h-full min-h-0 flex-col">
    <nav aria-label={ariaLabel} className="flex-1 space-y-1 p-3">
      {OPERATOR_NAVIGATION.map(({ label, path }) => (
        <NavLink key={path} to={path} className={navLinkClass} onClick={onNavigate}>
          {label}
        </NavLink>
      ))}
    </nav>
    <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <p className="break-words font-medium text-slate-700 dark:text-slate-200">{email}</p>
      <button
        type="button"
        className="mt-2 min-h-11 rounded-md px-3 text-left font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300 md:min-h-10"
        onClick={onSignOut}
      >
        Sign out
      </button>
    </div>
  </div>
);

const menuIcon = (
  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M4 6h16M4 12h16M4 18h16"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const OpsLayout = () => {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const mobileNavigationTriggerRef = useRef<HTMLButtonElement>(null);
  const { opsUser, logoutOps } = useAuth();
  const navigate = useNavigate();
  const operatorEmail = opsUser?.email ?? '—';

  const handleSignOut = () => {
    void logoutOps().then(() => navigate('/ops/login', { replace: true }));
  };

  const closeMobileNavigation = () => setMobileNavigationOpen(false);

  return (
    <div
      id="ops-shell"
      className="flex min-h-[100dvh] min-w-0 bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white"
    >
      <a
        href="#ops-main-content"
        className="fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(0.5rem,env(safe-area-inset-top))] z-[120] -translate-y-24 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow-lg transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 motion-reduce:transition-none"
      >
        Skip to operator content
      </a>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            {APP_BRAND.productName}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            Operator console
          </p>
        </div>
        <OperatorNavigation
          ariaLabel="Desktop operator navigation"
          email={operatorEmail}
          onSignOut={handleSignOut}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center gap-3 border-b border-slate-200 bg-white pb-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] dark:border-slate-800 dark:bg-slate-900 md:px-6 md:py-3">
          <IconButton
            ref={mobileNavigationTriggerRef}
            label="Open operator navigation"
            icon={menuIcon}
            className="md:hidden"
            aria-expanded={mobileNavigationOpen}
            aria-controls="operator-mobile-navigation"
            onClick={() => setMobileNavigationOpen(true)}
          />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 dark:text-white md:hidden">
            Operator console
          </p>
          <NavLink
            to="/dashboard"
            className="shrink-0 rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
          >
            ← Back to employee app
          </NavLink>
        </header>

        <main
          id="ops-main-content"
          tabIndex={-1}
          aria-label="Operator content"
          className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 md:p-6"
        >
          <Outlet />
        </main>
      </div>

      <Drawer
        isOpen={mobileNavigationOpen}
        onClose={closeMobileNavigation}
        title="Operator navigation"
        description="Choose an operations area."
        side="left"
      >
        <div id="operator-mobile-navigation" className="h-full">
          <OperatorNavigation
            ariaLabel="Mobile operator navigation"
            email={operatorEmail}
            onNavigate={closeMobileNavigation}
            onSignOut={handleSignOut}
          />
        </div>
      </Drawer>
    </div>
  );
};

export default OpsLayout;
