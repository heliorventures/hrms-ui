import { CalendarPlus, Files, ReceiptText, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { createPermissionService, type Capability } from '../../../auth/permissionService';
import { useAuth } from '../../../contexts/AuthContext';

interface QuickAccessDestination {
  path: string;
  to?: string;
  label: string;
  icon: LucideIcon;
  capability?: Capability;
  tourAnchor?: string;
}

const destinations: QuickAccessDestination[] = [
  {
    path: '/leave',
    to: '/leave?apply=1',
    label: 'Request leave',
    icon: CalendarPlus,
    capability: 'action.leave.submit',
    tourAnchor: 'dashboard-request-leave',
  },
  {
    path: '/payroll/payslips',
    to: '/payroll/payslips?tab=payslip',
    label: 'Payslips',
    icon: ReceiptText,
  },
  { path: '/organization/documents', label: 'Documents', icon: Files },
];

const HomeQuickAccess = () => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const available = destinations.filter(
    ({ path, capability }) =>
      permissions.canRoute(path) && (!capability || permissions.canCapability(capability))
  );
  if (!available.length) return null;
  return (
    <nav aria-label="Quick access" className="space-y-2" data-tour-anchor="dashboard-quick-access">
      <h2 className="text-sm font-semibold">Quick access</h2>
      <div className="flex flex-wrap gap-2">
        {available.map(({ path, to, label, icon: Icon, tourAnchor }) => (
          <Link
            key={to ?? path}
            to={to ?? path}
            data-tour-anchor={tourAnchor}
            className={`app-button inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none ${label === 'Request leave' ? 'border-accent bg-accent text-content-inverse hover:bg-accent-hover' : 'border-line bg-surface text-content-secondary hover:border-accent hover:text-accent'}`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default HomeQuickAccess;
