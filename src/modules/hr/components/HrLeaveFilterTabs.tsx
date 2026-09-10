import { TAB_LIST_CLASS, tabClassName } from '../../../components/common/tabStyles';

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
  <div className={TAB_LIST_CLASS}>
    {HR_LEAVE_FILTERS.map((filter) => (
      <button
        key={filter.id}
        type="button"
        aria-pressed={activeFilter === filter.id}
        className={tabClassName(activeFilter === filter.id)}
        onClick={() => onChange(filter.id)}
      >
        {filter.label}
        {filter.id === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
        {filter.id === 'actionable' && actionableCount > 0 ? ` (${actionableCount})` : ''}
      </button>
    ))}
  </div>
);

export default HrLeaveFilterTabs;
