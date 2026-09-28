import { CalendarDays, ClipboardList, Files, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';

import { createPermissionService } from '../../../auth/permissionService';
import { useAuth } from '../../../contexts/AuthContext';

const destinations = [
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
  const available = destinations.filter(({ path }) => permissions.canRoute(path));
  if (!available.length) return null;
  return (
    <nav aria-label="Quick access" className="space-y-3">
      <h2 className="text-base font-semibold">Quick access</h2>
      <div className="flex flex-wrap gap-3">
        {available.map(({ path, to, label, icon: Icon }) => (
          <Link
            key={path}
            to={to ?? path}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium text-content-secondary transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none"
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
