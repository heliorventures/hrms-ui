import { useCallback } from 'react';

import {
  ExitApprovalOperationDocument,
  FinanceFollowUpOwnersDocument,
} from '../../api/loans/graphql';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';

import ExitApprovalRecovery from './ExitApprovalRecovery';
import { exitDecisionFields } from './exitDecisionForm';
import ExitExposureSummary from './ExitExposureSummary';
import type { ExitExposure, FinanceOwner } from './exitFinanceModel';
import type { ExitPayrollContext } from './exitPayrollContext';
import ExitPayrollSummary from './ExitPayrollSummary';
import FinanceMessage from './FinanceMessage';
import LoanFields from './LoanFields';
import { useExitFinanceApproval } from './useExitFinanceApproval';
import { useExitFinancePreview } from './useExitFinancePreview';
import { useLoanOptions } from './useLoanOptions';

interface Props {
  separationId: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}
const ExitFinanceReview = ({ separationId, onClose, onSaved }: Props) => {
  const client = useGraphClient();
  const query = useRetainedQuery(
    useCallback(
      () => client.request(ExitApprovalOperationDocument, { separationId }),
      [client, separationId]
    )
  );
  if (query.phase === 'ready' && !query.data?.exitApprovalOperation)
    return <NewExitFinanceReview separationId={separationId} onClose={onClose} onSaved={onSaved} />;
  return (
    <Modal isOpen title="Recover financial approval" size="lg" onClose={onClose}>
      <FinanceMessage messages={[query.error]} />
      {query.data?.exitApprovalOperation ? (
        <ExitApprovalRecovery
          separationId={separationId}
          operation={query.data.exitApprovalOperation}
          reload={query.refreshChecked}
          onSaved={async () => {
            await onSaved();
            onClose();
          }}
        />
      ) : (
        <Button disabled={query.phase === 'initial-loading'} onClick={() => void query.refresh()}>
          {query.phase === 'initial-loading' ? 'Checking saved approval…' : 'Retry approval status'}
        </Button>
      )}
    </Modal>
  );
};

const NewExitFinanceReview = ({ separationId, onClose, onSaved }: Props) => {
  const owners = useLoanOptions<FinanceOwner>(
    FinanceFollowUpOwnersDocument,
    'financeFollowUpOwners'
  );
  const { date, setDate, preview, setPreview, values, setValues, loading, error, load } =
    useExitFinancePreview(separationId);
  const approval = useExitFinanceApproval(separationId, async () => {
    await onSaved();
    onClose();
  });
  const fields = reviewFields(preview, owners.data);
  return (
    <Modal
      isOpen
      title="Review loans before approving exit"
      size="xl"
      onClose={onClose}
      isDismissible={!approval.busy}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <Input
            label="Expected financial settlement date"
            type="date"
            value={date}
            disabled={Boolean(approval.reviewId)}
            onChange={(event) => {
              setDate(event.target.value);
              setPreview(null);
            }}
          />
          <Button
            disabled={!date || loading || Boolean(approval.reviewId)}
            onClick={() => void load()}
          >
            Load financial exposure
          </Button>
        </div>
        <FinanceMessage messages={[error, approval.error, owners.error]} />
        {loading && <p role="status">Loading current loan balances…</p>}
        {preview && (
          <>
            <ExitExposureSummary exposure={preview.exposure} />
            <ExitPayrollSummary context={preview.payrollContext} />
            <p className="text-sm text-content-secondary">
              Final payroll and FNF recoveries are separate proposals. Identify the final payroll
              cycle for any payroll amount. Uncovered debt requires a permitted continuing
              agreement. Approval records this decision and does not post repayment.
            </p>
            <fieldset disabled={approval.busy || Boolean(approval.reviewId)}>
              <LoanFields
                fields={fields}
                values={values}
                onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
              />
            </fieldset>

            {approval.reviewId && (
              <p className="text-sm">
                The financial decision is saved. Retry uses that same decision; refresh the exit
                list after any uncertain response.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" disabled={approval.busy} onClick={onClose}>
                Close
              </Button>
              <Button
                disabled={approval.busy || owners.phase === 'initial-loading'}
                onClick={() =>
                  void approval.approve(preview.exposure, preview.fingerprint, values, fields)
                }
              >
                {approval.approved ? 'Refresh exit records' : 'Save review and approve exit'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
export default ExitFinanceReview;

function reviewFields(
  preview: { exposure: ExitExposure; payrollContext: ExitPayrollContext } | null,
  owners: { nodes: FinanceOwner[] } | null
) {
  if (!preview) return [];
  return [
    ...exitDecisionFields(
      preview.exposure,
      owners?.nodes ?? [],
      true,
      preview.payrollContext.draftCycles
    ),
    { key: 'reason', label: 'Financial review and recovery decision', type: 'textarea' as const },
  ];
}
