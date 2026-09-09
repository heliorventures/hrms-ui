import type { ComponentProps, RefObject } from 'react';

import Card from '../../../components/common/Card';
import LeaveRequestsTableSection from '../../leave/components/LeaveRequestsTableSection';

import { HrLeaveQueueFilters, HrLeaveQueuePager } from './HrLeaveQueueControls';

interface HrLeaveQueueSectionProps {
  dataPresent: boolean;
  filters: ComponentProps<typeof HrLeaveQueueFilters>;
  loading: boolean;
  pager: ComponentProps<typeof HrLeaveQueuePager>;
  queueRef: RefObject<HTMLElement>;
  table: ComponentProps<typeof LeaveRequestsTableSection>;
  unavailable: boolean;
}

type QueueBodyProps = Pick<
  HrLeaveQueueSectionProps,
  'dataPresent' | 'loading' | 'table' | 'unavailable'
>;

const HrLeaveQueueBody = ({ dataPresent, loading, table, unavailable }: QueueBodyProps) => {
  if (loading && !dataPresent) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading Requests...</p>;
  }
  if (unavailable) {
    return <p className="text-sm text-danger">Requests are unavailable. Refresh to try again.</p>;
  }
  return <LeaveRequestsTableSection {...table} />;
};

const HrLeaveQueueSection = ({
  dataPresent,
  filters,
  loading,
  pager,
  queueRef,
  table,
  unavailable,
}: HrLeaveQueueSectionProps) => (
  <section ref={queueRef} tabIndex={-1} aria-label="Leave approval queue">
    <Card title="Requests">
      <HrLeaveQueueFilters {...filters} />
      <HrLeaveQueueBody
        dataPresent={dataPresent}
        loading={loading}
        table={table}
        unavailable={unavailable}
      />
      <HrLeaveQueuePager {...pager} />
    </Card>
  </section>
);

export default HrLeaveQueueSection;
