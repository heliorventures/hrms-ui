import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import FeedbackToast from '../../../components/common/FeedbackToast';
import type { ImportedLeaveHistory } from '../importedLeaveTypes';

interface Props {
  data: ImportedLeaveHistory | null;
  error: string | null;
  onRetry: () => void;
}
const ImportedLeaveHistoryCard = ({ data, error, onRetry }: Props) => {
  if (error)
    return (
      <Card title="Imported leave history">
        <FeedbackToast variant={'error'} messageKey={error}>
          {error}
        </FeedbackToast>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    );
  if (!data) return null;
  const { opening } = data;
  const values: [string, string | null][] = [
    [`Carry-forward (${opening.year - 1})`, opening.carry_forward],
    [`Allocation (${opening.year})`, opening.grant],
    ['Paid leave already used', opening.paid_used],
    ['Paid balance at import', opening.paid_remaining],
    ['Pending at import', opening.pending],
    ['Planned at import', opening.planned],
    ['Historical unpaid leave taken', data.historical_lwp],
  ];
  return (
    <Card title={`Leave opening as of ${data.as_of}`}>
      {!data.ready && (
        <p role="status" className="mb-3 text-sm text-amber-800">
          HR review required. Source leave values have not been reconciled.
        </p>
      )}
      <dl className="grid gap-3 sm:grid-cols-3">
        {values.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="font-medium">{value ?? 'Not supplied'}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-slate-600">
        Historical unpaid usage is separate from approved leave requests and monthly salary
        deductions. Unpaid leave has no quota and follows the approval workflow.
      </p>
    </Card>
  );
};
export default ImportedLeaveHistoryCard;
