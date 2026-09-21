import { Link } from 'react-router-dom';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import type { PerformanceReviewRow } from './performanceLifecycleQueries';

type ReviewLane = 'self' | 'team';

interface Props {
  canManage: boolean;
  canSelf: boolean;
  isBusy: (key: string) => boolean;
  onAdvance: (review: PerformanceReviewRow) => void;
  onOpen: (reviewId: string) => void;
  reviews: Array<{ lane: ReviewLane; row: PerformanceReviewRow }>;
  showProcess: boolean;
  showSelf: boolean;
  tab: string;
}

const advanceLabel = (stage: string) => {
  if (stage === 'HR_CALIBRATION') return 'Complete calibration';
  if (stage === 'EMPLOYEE_ACKNOWLEDGEMENT') return 'Close cycle';
  return 'Advance cycle';
};

const PerformanceReviewList = ({
  canManage,
  canSelf,
  isBusy,
  onAdvance,
  onOpen,
  reviews,
  showProcess,
  showSelf,
  tab,
}: Props) => {
  const title = showSelf ? 'My Performance' : showProcess ? 'Cycle progress' : 'Team reviews';
  const isLoading = isBusy(`reviews:${tab}`);
  return (
    <Card title={title}>
      {isLoading && <p role="status">Loading reviewsâ€¦</p>}
      {!isLoading && reviews.length === 0 && (
        <p className="text-sm text-content-secondary">No assigned performance reviews.</p>
      )}
      {!isLoading && reviews.length > 0 && (
        <ul className="divide-y divide-line">
          {reviews.map(({ row, lane }) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{row.employeeName} Â· {row.cycleName}</p>
                <p className="text-xs text-content-secondary">
                  {row.cycleStage.replace(/_/g, ' ')} Â· {row.status}
                </p>
              </div>
              <div className="flex gap-2">
                {showProcess && lane === 'self' && canSelf && (
                  <Link
                    className="rounded-md border border-line px-3 py-2 text-sm text-accent"
                    to={`/performance?tab=my&review=${encodeURIComponent(row.id)}`}
                  >
                    Open my review
                  </Link>
                )}
                {(!showProcess || lane !== 'self') && (
                  <Button
                    size="sm"
                    variant="outline"
                    busy={isBusy(`open:${row.id}`)}
                    onClick={() => onOpen(row.id)}
                  >
                    Open {lane === 'self' ? 'my review' : 'evaluation'}
                  </Button>
                )}
                {canManage &&
                  (showProcess || tab === 'review') &&
                  row.cycleStage !== 'CLOSED' && (
                    <Button
                      busy={isBusy(`advance:${row.reviewCycleId}`)}
                      size="sm"
                      variant="quiet"
                      onClick={() => onAdvance(row)}
                    >
                      {advanceLabel(row.cycleStage)}
                    </Button>
                  )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default PerformanceReviewList;
