import Button from '../../../components/common/Button';

export type HrLeaveFilter =
  | 'actionable'
  | 'pending'
  | 'all'
  | 'approved'
  | 'rejected'
  | 'cancelled';

const HR_LEAVE_FILTERS: Array<{ id: HrLeaveFilter; label: string }> = [
  { id: 'actionable', label: 'Needs my action' },
  { id: 'pending', label: 'Pending in scope' },
  { id: 'all', label: 'All' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'cancelled', label: 'Cancelled' },
];

interface HrLeaveFilterTabsProps {
  activeFilter: HrLeaveFilter;
  pendingCount: number;
  actionableCount: number;
  onChange: (filter: HrLeaveFilter) => void;
}

const HrLeaveFilterTabs = ({
  activeFilter,
  pendingCount,
  actionableCount,
  onChange,
}: HrLeaveFilterTabsProps) => (
  <div className="mb-4 flex flex-wrap gap-2">
    {HR_LEAVE_FILTERS.map((filter) => (
      <Button
        key={filter.id}
        type="button"
        variant={activeFilter === filter.id ? 'primary' : 'outline'}
        aria-pressed={activeFilter === filter.id}
        className="!py-1.5 !text-xs"
        onClick={() => onChange(filter.id)}
      >
        {filter.label}
        {filter.id === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
        {filter.id === 'actionable' && actionableCount > 0 ? ` (${actionableCount})` : ''}
      </Button>
    ))}
  </div>
);

export default HrLeaveFilterTabs;
