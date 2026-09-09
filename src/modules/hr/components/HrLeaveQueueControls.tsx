import Button from '../../../components/common/Button';

import HrLeaveFilterTabs, { type HrLeaveFilter } from './HrLeaveFilterTabs';

export interface QueueViewChange {
  year?: string;
  page?: string;
  status?: string;
}

export const HrLeaveQueueFilters = ({
  year,
  years,
  filter,
  total,
  pending,
  actionable,
  loading,
  onChange,
}: {
  year: number;
  years: number[];
  filter: HrLeaveFilter;
  total: number;
  pending: number;
  actionable: number;
  loading: boolean;
  onChange: (change: QueueViewChange) => void;
}) => {
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-content-secondary" role="status">
          {loading ? 'Loading requests…' : `${total} matching requests`}
        </p>
        <label className="flex items-center gap-2 text-sm">
          Year
          <select
            aria-label="Approval year"
            value={year}
            onChange={(event) => onChange({ year: event.target.value, page: '0' })}
            className="rounded border border-line bg-surface px-2 py-1 text-content-primary focus-visible:ring-2 focus-visible:ring-focus"
          >
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <HrLeaveFilterTabs
        activeFilter={filter}
        pendingCount={pending}
        actionableCount={actionable}
        onChange={(status) => onChange({ status, page: '0' })}
      />
    </>
  );
};

export const HrLeaveQueuePager = ({
  page,
  size,
  total,
  loading,
  onChange,
}: {
  page: number;
  size: number;
  total: number;
  loading: boolean;
  onChange: (change: QueueViewChange) => void;
}) => {
  return (
    <nav aria-label="Leave request pages" className="mt-3 flex items-center justify-between gap-2">
      <p className="text-sm text-content-secondary">
        {total
          ? `${page * size + 1}–${Math.min((page + 1) * size, total)} of ${total}`
          : 'No matching requests'}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          aria-label="Previous leave requests"
          disabled={loading || page === 0}
          onClick={() => onChange({ page: String(page - 1) })}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label="Next leave requests"
          disabled={loading || (page + 1) * size >= total}
          onClick={() => onChange({ page: String(page + 1) })}
        >
          Next
        </Button>
      </div>
    </nav>
  );
};
