import { useState, type ComponentProps, type RefObject } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LeaveRequestsTableSection from '../../leave/components/LeaveRequestsTableSection';

import { HrLeaveQueueFilters, HrLeaveQueuePager } from './HrLeaveQueueControls';
import LeaveApprovalReview from './LeaveApprovalReview';

interface HrLeaveQueueSectionProps {
  dataPresent: boolean;
  filters: ComponentProps<typeof HrLeaveQueueFilters>;
  loading: boolean;
  pager: ComponentProps<typeof HrLeaveQueuePager>;
  queueRef: RefObject<HTMLElement>;
  table: ComponentProps<typeof LeaveRequestsTableSection>;
  unavailable: boolean;
  readOnly?: boolean;
}

type QueueBodyProps = Pick<
  HrLeaveQueueSectionProps,
  'dataPresent' | 'loading' | 'table' | 'unavailable'
> & { review: boolean };

const HrLeaveQueueBody = ({ dataPresent, loading, table, unavailable, review }: QueueBodyProps) => {
  if (loading && !dataPresent) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading Requests...</p>;
  }
  if (unavailable) {
    return <p className="text-sm text-danger">Requests are unavailable. Refresh to try again.</p>;
  }
  return review ? <LeaveApprovalReview {...table} /> : <LeaveRequestsTableSection {...table} />;
};

const HrLeaveQueueSection = ({
  dataPresent,
  filters,
  loading,
  pager,
  queueRef,
  table,
  unavailable,
  readOnly = false,
}: HrLeaveQueueSectionProps) => {
  const [review, setReview] = useState(true);
  return (
    <section ref={queueRef} tabIndex={-1} aria-label="Leave approval queue">
      <Card title="Requests">
        <HrLeaveQueueFilters {...filters} />
        <div role="group" aria-label="Request view" className="my-4 flex gap-2">
          <Button
            variant={review ? 'primary' : 'outline'}
            size="sm"
            aria-pressed={review}
            onClick={() => setReview(true)}
          >
            Review
          </Button>
          <Button
            variant={review ? 'outline' : 'primary'}
            size="sm"
            aria-pressed={!review}
            onClick={() => setReview(false)}
          >
            Table
          </Button>
        </div>
        <HrLeaveQueueBody
          dataPresent={dataPresent}
          loading={loading}
          table={{
            ...table,
            actionsDisabled:
              readOnly || loading || table.approveBusyId !== null || table.cancelBusyId !== null,
          }}
          unavailable={unavailable}
          review={review}
        />
        <HrLeaveQueuePager {...pager} />
      </Card>
    </section>
  );
};

export default HrLeaveQueueSection;
