import { useId, useState } from 'react';

import { createPermissionService } from '../../../auth/permissionService';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Modal from '../../../components/common/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import {
  CompOffApprovalDocument,
  DecideCompOffDocument,
  type CompOffClaim,
} from '../compOffDocuments';
import { useCompOffOwnerKey, useCompOffResource } from '../hooks/useCompOffResource';

const RejectCredit = ({
  claim,
  busy,
  error,
  close,
  submit,
}: {
  claim: CompOffClaim;
  busy: boolean;
  error: string | null;
  close: () => void;
  submit: (reason: string) => Promise<boolean>;
}) => {
  const formId = useId();
  const [reason, setReason] = useState('');
  return (
    <Modal
      isOpen
      title="Reject comp-off credit"
      size="md"
      isDismissible={!busy}
      onClose={close}
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={close}>
            Back
          </Button>
          <Button type="submit" form={formId} variant="danger" busy={busy}>
            Reject request
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!reason.trim()) return;
          void submit(reason.trim()).then((saved) => {
            if (saved) close();
          });
        }}
      >
        <p className="text-sm">
          {claim.employeeName} · {claim.workedDate} · {claim.units} day
        </p>
        <label className="block space-y-1 text-sm font-medium">
          Reason for rejection
          <textarea
            required
            maxLength={1000}
            rows={3}
            disabled={busy}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-status-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};

const QueueTable = ({
  rows,
  busy,
  approve,
  reject,
}: {
  rows: CompOffClaim[];
  busy: boolean;
  approve: (id: string) => void;
  reject: (row: CompOffClaim) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[560px] text-left text-sm">
      <thead>
        <tr className="border-b border-line text-content-secondary">
          <th className="py-2">Employee</th>
          <th>Date worked</th>
          <th>Credit</th>
          <th>Work / reason</th>
          <th className="text-right">Review</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-line">
            <td className="py-3">
              <p className="font-medium">{row.employeeName}</p>
              <p className="text-xs text-content-secondary">{row.employeeCode}</p>
            </td>
            <td>{row.workedDate}</td>
            <td>{row.units} day</td>
            <td className="max-w-xs whitespace-normal py-2 pr-3">
              {row.reason || 'No reason supplied'}
            </td>
            <td>
              <div className="flex justify-end gap-2">
                <Button size="sm" disabled={busy} onClick={() => approve(row.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => reject(row)}>
                  Reject
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {rows.length === 0 && (
      <p className="py-4 text-sm text-content-secondary">No pending comp-off requests.</p>
    )}
  </div>
);

const ApprovalQueue = () => {
  const [page, setPage] = useState(0);
  const [reject, setReject] = useState<CompOffClaim | null>(null);
  const board = useCompOffResource<{ compOffClaims: CompOffClaim[] }>(CompOffApprovalDocument, {
    offset: page * 20,
  });
  const rows = board.data?.compOffClaims ?? [];
  const busy = board.loading || board.busy;
  const decide = (claimId: string, approve: boolean, reason: string | null = null) =>
    board.mutate(DecideCompOffDocument, { claimId, approve, reason });
  return (
    <Card title="Comp-off credit approvals">
      {board.loading && (
        <p role="status" className="text-sm text-content-secondary">
          Loading requests…
        </p>
      )}
      {board.error && !reject && (
        <div role="alert" className="flex items-center gap-3 text-sm text-status-danger">
          {board.error}
          <Button size="sm" variant="outline" onClick={board.reload}>
            Retry
          </Button>
        </div>
      )}
      {board.data && (
        <>
          <QueueTable
            rows={rows}
            busy={busy}
            approve={(id) => {
              void decide(id, true);
            }}
            reject={setReject}
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="quiet"
              disabled={page === 0 || busy}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-content-secondary">Page {page + 1}</span>
            <Button
              size="sm"
              variant="quiet"
              disabled={rows.length < 20 || busy}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
      {reject && (
        <RejectCredit
          claim={reject}
          busy={board.busy}
          error={board.error}
          close={() => setReject(null)}
          submit={(reason) => decide(reject.id, false, reason)}
        />
      )}
    </Card>
  );
};

const CompOffApprovalPanel = () => {
  const { clientSession } = useAuth();
  const owner = useCompOffOwnerKey();
  if (!createPermissionService(clientSession).canCapability('action.leave.approve')) return null;
  return <ApprovalQueue key={owner} />;
};
export default CompOffApprovalPanel;
