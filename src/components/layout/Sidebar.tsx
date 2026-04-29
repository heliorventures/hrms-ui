import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { matchesNavFilter, NAV_CATALOG } from '../../navigation/navCatalog';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
  adminOnly?: boolean;
}

interface NavItemWithChildren {
  label: string;
  icon: JSX.Element;
  children: { path: string; label: string }[];
}

const organizationNav: NavItemWithChildren = {
  label: 'Organization',
  icon: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  children: [
    { path: '/organization/employees', label: 'Employees' },
    { path: '/organization/org-chart', label: 'Org chart' },
    { path: '/organization/documents', label: 'Documents' },
  ],
};

const workplaceNav: NavItemWithChildren = {
  label: 'Workplace',
  icon: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  children: [
    { path: '/workplace/benefits', label: 'Benefits' },
    { path: '/workplace/recruitment', label: 'Recruitment' },
    { path: '/workplace/onboarding', label: 'Onboarding & exit' },
    { path: '/workplace/workflows', label: 'Workflows' },
    { path: '/workplace/performance', label: 'Performance' },
    { path: '/workplace/succession', label: 'Succession' },
    { path: '/workplace/compensation', label: 'Compensation' },
    { path: '/workplace/learning', label: 'Learning' },
    { path: '/workplace/assets', label: 'Assets' },
    { path: '/workplace/grievance', label: 'Grievance' },
  ],
};

const adminNav: NavItemWithChildren = {
  label: 'Admin',
  icon: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  children: [
    { path: '/admin/employees', label: 'Employees' },
    { path: '/admin/attendance-policy', label: 'Attendance policy' },
    { path: '/admin/reports', label: 'Reports' },
    { path: '/admin/module-health', label: 'Service health' },
    { path: '/admin/settings', label: 'Settings' },
  ],
};

function itemMatchesMenuFilter(query: string, path: string, label: string): boolean {
  if (!query.trim()) return true;
  const kws = NAV_CATALOG.find((e) => e.path === path)?.keywords ?? [];
  return matchesNavFilter(query, label, path, kws);
}

const payrollNav: NavItemWithChildren = {
  label: 'Payroll',
  icon: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  children: [
    { path: '/payroll/payslips', label: 'Payslips' },
    { path: '/payroll/compensation', label: 'Compensation setup' },
    { path: '/payroll/pay', label: 'Income tax (self)' },
    { path: '/payroll/tax', label: 'Tax admin' },
  ],
};

function isPayrollAdminPath(path: string): boolean {
  return path === '/payroll/compensation' || path === '/payroll/tax';
}

/* eslint-disable max-lines-per-function -- single sidebar shell: nav groups + mobile overlay */
const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { role } = useAuth();
  const location = useLocation();
  const isOrgPath = location.pathname.startsWith('/organization');
  const isWorkplacePath = location.pathname.startsWith('/workplace');
  const isPayrollPath = location.pathname.startsWith('/payroll');
  const isAdminPath = location.pathname.startsWith('/admin');
  const [menuFilter, setMenuFilter] = useState('');
  const [orgExpanded, setOrgExpanded] = useState(isOrgPath);
  const [workplaceExpanded, setWorkplaceExpanded] = useState(isWorkplacePath);
  const [payrollExpanded, setPayrollExpanded] = useState(isPayrollPath);
  const [adminExpanded, setAdminExpanded] = useState(isAdminPath);

  const filterQ = menuFilter.trim();
  const filterActive = filterQ.length > 0;

  const orgChildren = useMemo(
    () => organizationNav.children.filter((c) => itemMatchesMenuFilter(filterQ, c.path, c.label)),
    [filterQ]
  );
  const workplaceChildren = useMemo(
    () => workplaceNav.children.filter((c) => itemMatchesMenuFilter(filterQ, c.path, c.label)),
    [filterQ]
  );
  const payrollChildren = useMemo(
    () =>
      payrollNav.children.filter((c) => {
        if (role !== 'admin' && isPayrollAdminPath(c.path)) return false;
        if (role !== 'admin' && c.path === '/payroll/pay') {
          return itemMatchesMenuFilter(filterQ, c.path, 'Income tax');
        }
        return itemMatchesMenuFilter(filterQ, c.path, c.label);
      }),
    [filterQ, role]
  );
  const adminChildren = useMemo(
    () => adminNav.children.filter((c) => itemMatchesMenuFilter(filterQ, c.path, c.label)),
    [filterQ]
  );

  /** Single accent system: neutral nav, clear active state (common on enterprise HRIS shells). */
  const nav = {
    item: 'mx-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    active:
      'bg-white text-slate-900 shadow-card ring-1 ring-slate-200/90 dark:bg-slate-800 dark:text-white dark:ring-slate-600/90',
    inactive:
      'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100',
    sub: 'mx-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
    groupBtn:
      'mx-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
  };

  const navItems: NavItem[] = [
    {
      path: '/insights',
      label: 'Insights',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      path: '/attendance',
      label: 'Attendance',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      path: '/leave',
      label: 'Leave',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      path: '/expenses',
      label: 'Expenses',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      path: '/notifications',
      label: 'Notifications',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
  ];

  const filteredNavItems = useMemo(
    () =>
      navItems
        .filter((item) => !item.adminOnly || role === 'admin')
        .filter((item) => !filterActive || itemMatchesMenuFilter(filterQ, item.path, item.label)),
    [filterActive, filterQ, role]
  );

  const showOrgExpanded = orgExpanded || isOrgPath || (filterActive && orgChildren.length > 0);
  const showWorkplaceExpanded =
    workplaceExpanded || isWorkplacePath || (filterActive && workplaceChildren.length > 0);
  const showPayrollExpanded = payrollExpanded || isPayrollPath || (filterActive && payrollChildren.length > 0);
  const showAdminExpanded = adminExpanded || isAdminPath || (filterActive && adminChildren.length > 0);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200/90 bg-white
          transition-transform duration-200 ease-out dark:border-slate-700/90 dark:bg-slate-900 lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-slate-200/90 px-4 dark:border-slate-700/90">
            <span className="text-lg font-semibold tracking-tight text-indigo-600 dark:text-indigo-400">
              KabiPay
            </span>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Close sidebar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="border-b border-slate-200/80 px-3 pb-2 pt-1 dark:border-slate-700/80">
            <div className="relative">
              <span
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="search"
                value={menuFilter}
                onChange={(e) => setMenuFilter(e.target.value)}
                placeholder="Filter menu, pages…"
                className="w-full rounded-lg border border-slate-200/90 bg-slate-50/90 py-1.5 pl-8 pr-2 text-xs text-slate-900 shadow-inner placeholder-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
                aria-label="Filter sidebar menu"
              />
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-2 pt-3">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Workspace
            </p>
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `${nav.item} ${isActive ? nav.active : nav.inactive}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}

            {(!filterActive || orgChildren.length > 0) && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setOrgExpanded(!showOrgExpanded)}
                  className={`${nav.groupBtn} ${
                    isOrgPath
                      ? 'bg-slate-200/50 font-semibold text-slate-900 dark:bg-slate-800/80 dark:text-slate-100'
                      : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {organizationNav.icon}
                    <span>{organizationNav.label}</span>
                  </div>
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform ${showOrgExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showOrgExpanded && orgChildren.length > 0 && (
                  <div className="ml-2 mt-1 space-y-0.5 border-l border-slate-200/90 pl-2 dark:border-slate-600/80">
                    {orgChildren.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `${nav.sub} ${isActive ? nav.active : nav.inactive}`
                        }
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
                {showOrgExpanded && orgChildren.length === 0 && filterActive && (
                  <p className="ml-2 mt-1 pl-2 text-xs text-slate-400">No items match</p>
                )}
              </div>
            )}

            {(!filterActive || workplaceChildren.length > 0) && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setWorkplaceExpanded(!showWorkplaceExpanded)}
                  className={`${nav.groupBtn} ${
                    isWorkplacePath
                      ? 'bg-slate-200/50 font-semibold text-slate-900 dark:bg-slate-800/80 dark:text-slate-100'
                      : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {workplaceNav.icon}
                    <span>{workplaceNav.label}</span>
                  </div>
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform ${showWorkplaceExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showWorkplaceExpanded && workplaceChildren.length > 0 && (
                  <div className="ml-2 mt-1 space-y-0.5 border-l border-slate-200/90 pl-2 dark:border-slate-600/80">
                    {workplaceChildren.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `${nav.sub} ${isActive ? nav.active : nav.inactive}`
                        }
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
                {showWorkplaceExpanded && workplaceChildren.length === 0 && filterActive && (
                  <p className="ml-2 mt-1 pl-2 text-xs text-slate-400">No items match</p>
                )}
              </div>
            )}

            {(!filterActive || payrollChildren.length > 0) && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setPayrollExpanded(!showPayrollExpanded)}
                  className={`${nav.groupBtn} ${
                    isPayrollPath
                      ? 'bg-slate-200/50 font-semibold text-slate-900 dark:bg-slate-800/80 dark:text-slate-100'
                      : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {payrollNav.icon}
                    <span>{payrollNav.label}</span>
                  </div>
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform ${showPayrollExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showPayrollExpanded && payrollChildren.length > 0 && (
                  <div className="ml-2 mt-1 space-y-0.5 border-l border-slate-200/90 pl-2 dark:border-slate-600/80">
                    {payrollChildren.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `${nav.sub} ${isActive ? nav.active : nav.inactive}`
                        }
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
                {showPayrollExpanded && payrollChildren.length === 0 && filterActive && (
                  <p className="ml-2 mt-1 pl-2 text-xs text-slate-400">No items match</p>
                )}
              </div>
            )}

            {role === 'admin' && (!filterActive || adminChildren.length > 0) && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAdminExpanded(!showAdminExpanded)}
                  className={`${nav.groupBtn} ${
                    isAdminPath
                      ? 'bg-slate-200/50 font-semibold text-slate-900 dark:bg-slate-800/80 dark:text-slate-100'
                      : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {adminNav.icon}
                    <span>{adminNav.label}</span>
                  </div>
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform ${showAdminExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showAdminExpanded && adminChildren.length > 0 && (
                  <div className="ml-2 mt-1 space-y-0.5 border-l border-slate-200/90 pl-2 dark:border-slate-600/80">
                    {adminChildren.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `${nav.sub} ${isActive ? nav.active : nav.inactive}`
                        }
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
                {showAdminExpanded && adminChildren.length === 0 && filterActive && (
                  <p className="ml-2 mt-1 pl-2 text-xs text-slate-400">No items match</p>
                )}
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};
/* eslint-enable max-lines-per-function */

export default Sidebar;
