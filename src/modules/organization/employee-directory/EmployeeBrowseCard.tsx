import { ArrowUpRight, Building2 } from 'lucide-react';
import type { KeyboardEventHandler } from 'react';

import Badge from '../../../components/common/Badge';

import { directoryInitials, type DirectoryEmployee } from './employeeDirectoryModel';

interface Props {
  employee: DirectoryEmployee;
  selected: boolean;
  detailsId: string;
  onSelect: () => void;
  onKeyDown: KeyboardEventHandler<HTMLButtonElement>;
}

const EmployeeBrowseCard = ({ employee, selected, detailsId, onSelect, onKeyDown }: Props) => (
  <button
    type="button"
    aria-label={`Show work details for ${employee.fullName} (${employee.employeeCode})`}
    aria-pressed={selected}
    aria-controls={detailsId}
    onClick={onSelect}
    onKeyDown={onKeyDown}
    className={`app-card app-employee-browse-card flex min-h-[15.75rem] w-[min(18.75rem,85%)] shrink-0 snap-start flex-col gap-3 rounded-2xl border p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 ${selected ? 'border-accent bg-surface-selected' : 'border-line bg-surface hover:border-accent/60'}`}
  >
    <span className="flex items-center justify-between gap-2">
      <span
        aria-hidden="true"
        className="flex size-[3.25rem] shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-lg font-semibold text-accent"
      >
        {directoryInitials(employee.fullName)}
      </span>
      <Badge size="sm" variant={employee.status.toLowerCase() === 'active' ? 'success' : 'neutral'}>
        {employee.status}
      </Badge>
    </span>
    <span className="min-w-0">
      <span className="app-employee-card-name block break-words text-lg font-semibold text-content-primary">
        {employee.fullName}
      </span>
      <span className="block break-words text-xs text-content-muted">{employee.employeeCode}</span>
    </span>
    <span className="min-w-0 space-y-1 text-sm text-content-secondary">
      <span className="block break-words">
        {employee.designationTitle ?? 'Designation not recorded'}
      </span>
      <span className="flex items-start gap-1.5">
        <Building2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span className="break-words">{employee.departmentName ?? 'Department not recorded'}</span>
      </span>
    </span>
    <span className="mt-auto flex w-full items-center justify-between gap-2 border-t border-line pt-2 text-xs font-semibold text-accent">
      Show work details <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
    </span>
  </button>
);
export default EmployeeBrowseCard;
