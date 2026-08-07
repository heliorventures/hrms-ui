import Button from '../../../components/common/Button';

export type HrLeaveFilter = 'pending' | 'all' | 'approved' | 'rejected' | 'cancelled';

const HR_LEAVE_FILTERS: Array<{ id: HrLeaveFilter; label: string }> = [
  { id: 'pending', label: 'Pending' },
  { id: 'all', label: 'All' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'cancelled', label: 'Cancelled' },
];

interface HrLeaveFilterTabsProps {
  activeFilter: HrLeaveFilter;
  pendingCount: number;
  onChange: (filter: HrLeaveFilter) => void;
}

const HrLeaveFilterTabs = ({ activeFilter, pendingCount, onChange }: HrLeaveFilterTabsProps) => (
  <div className="mb-4 flex flex-wrap gap-2">
    {HR_LEAVE_FILTERS.map((filter) => (
      <Button
        key={filter.id}
        type="button"
        variant={activeFilter === filter.id ? 'primary' : 'outline'}
        className="!py-1.5 !text-xs"
        onClick={() => onChange(filter.id)}
      >
        {filter.label}
        {filter.id === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
      </Button>
    ))}
  </div>
);

export default HrLeaveFilterTabs;
