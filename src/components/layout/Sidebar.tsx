import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
    { path: '/organization/documents', label: 'Documents' },
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
    { path: '/admin/reports', label: 'Reports' },
    { path: '/admin/settings', label: 'Settings' },
  ],
};

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
    { path: '/payroll/pay', label: 'Pay' },
    { path: '/payroll/tax', label: 'Tax' },
  ],
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { role } = useAuth();
  const location = useLocation();
  const isOrgPath = location.pathname.startsWith('/organization');
  const isPayrollPath = location.pathname.startsWith('/payroll');
  const isAdminPath = location.pathname.startsWith('/admin');
  const [orgExpanded, setOrgExpanded] = useState(isOrgPath);
  const [payrollExpanded, setPayrollExpanded] = useState(isPayrollPath);
  const [adminExpanded, setAdminExpanded] = useState(isAdminPath);

  const getNavItemColors = (path: string) => {
    if (path === '/dashboard') {
      return {
        active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md',
        inactive: 'text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-blue-900/20',
      };
    }
    if (path === '/attendance') {
      return {
        active: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md',
        inactive: 'text-gray-700 hover:bg-green-50 dark:text-gray-300 dark:hover:bg-green-900/20',
      };
    }
    if (path === '/leave') {
      return {
        active: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md',
        inactive: 'text-gray-700 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-orange-900/20',
      };
    }
    if (path.startsWith('/payroll')) {
      return {
        active: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md',
        inactive: 'text-gray-700 hover:bg-purple-50 dark:text-gray-300 dark:hover:bg-purple-900/20',
      };
    }
    if (path === '/expenses') {
      return {
        active: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md',
        inactive: 'text-gray-700 hover:bg-red-50 dark:text-gray-300 dark:hover:bg-red-900/20',
      };
    }
    if (path === '/notifications') {
      return {
        active: 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md',
        inactive: 'text-gray-700 hover:bg-cyan-50 dark:text-gray-300 dark:hover:bg-cyan-900/20',
      };
    }
    if (path.startsWith('/organization')) {
      return {
        active: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md',
        inactive: 'text-gray-700 hover:bg-amber-50 dark:text-gray-300 dark:hover:bg-amber-900/20',
      };
    }
    if (path.startsWith('/admin')) {
      return {
        active: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md',
        inactive: 'text-gray-700 hover:bg-indigo-50 dark:text-gray-300 dark:hover:bg-indigo-900/20',
      };
    }
    return {
      active: 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200',
      inactive: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
    };
  };

  const navItems: NavItem[] = [
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

  const filteredNavItems = navItems.filter((item) => !item.adminOnly || role === 'admin');

  const showOrgExpanded = orgExpanded || isOrgPath;
  const showPayrollExpanded = payrollExpanded || isPayrollPath;
  const showAdminExpanded = adminExpanded || isAdminPath;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform border-r border-gray-200 
          bg-gradient-to-b from-gray-50 to-white transition-transform duration-300 ease-in-out dark:border-gray-700 
          dark:from-gray-800 dark:to-gray-900 lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-primary-200 bg-gradient-to-r from-primary-600 to-purple-600 px-4 dark:border-gray-700 dark:from-primary-800 dark:to-purple-900">
            <span className="text-lg font-semibold text-white drop-shadow-md">KabiPay</span>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white transition-all hover:bg-white/20 lg:hidden"
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

          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {filteredNavItems.map((item) => {
              const colors = getNavItemColors(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive ? colors.active : colors.inactive
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setOrgExpanded(!showOrgExpanded)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                  isOrgPath
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-amber-50 dark:text-gray-300 dark:hover:bg-amber-900/20'
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
              {showOrgExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-amber-200 pl-3 dark:border-amber-800">
                  {organizationNav.children.map((child) => {
                    const subColors = getNavItemColors(child.path);
                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
                            isActive ? subColors.active : subColors.inactive
                          }`
                        }
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPayrollExpanded(!showPayrollExpanded)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                  isPayrollPath
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-purple-50 dark:text-gray-300 dark:hover:bg-purple-900/20'
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
              {showPayrollExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-purple-200 pl-3 dark:border-purple-800">
                  {payrollNav.children.map((child) => {
                    const subColors = getNavItemColors(child.path);
                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
                            isActive ? subColors.active : subColors.inactive
                          }`
                        }
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            {role === 'admin' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAdminExpanded(!showAdminExpanded)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                    isAdminPath
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-indigo-50 dark:text-gray-300 dark:hover:bg-indigo-900/20'
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
                {showAdminExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-indigo-200 pl-3 dark:border-indigo-800">
                    {adminNav.children.map((child) => {
                      const subColors = getNavItemColors(child.path);
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
                              isActive ? subColors.active : subColors.inactive
                            }`
                          }
                        >
                          <span>{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
