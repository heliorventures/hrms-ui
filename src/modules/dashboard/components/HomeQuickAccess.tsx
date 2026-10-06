import {
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Files,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react';
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
  { path: '/my-work/tasks', label: 'My tasks', icon: ClipboardList },
  {
    path: '/payroll/payslips',
    to: '/payroll/payslips?tab=payslip',
    label: 'Payslips',
    icon: ReceiptText,
  },
  { path: '/organization/documents', label: 'Documents', icon: Files },
  { path: '/leave', label: 'My leave', icon: CalendarDays },
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
    <nav aria-label="Quick access" className="space-y-3" data-tour-anchor="dashboard-quick-access">
      <h2 className="text-base font-semibold">Quick access</h2>
      <div className="flex flex-wrap gap-3">
        {available.map(({ path, to, label, icon: Icon, tourAnchor }) => (
          <Link
            key={to ?? path}
            to={to ?? path}
            data-tour-anchor={tourAnchor}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-content-secondary transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none"
          >
            <Icon className="size-5 text-accent" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default HomeQuickAccess;
