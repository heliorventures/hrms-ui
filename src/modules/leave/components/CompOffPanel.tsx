import { useId, useState } from 'react';

import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import { useTenant } from '../../../contexts/TenantContext';
import { tenantDateKey } from '../../../utils/tenantTime';
import {
  CancelCompOffDocument,
  MyCompOffDocument,
  SubmitCompOffDocument,
  type CompOffClaim,
  type CompOffSummary,
} from '../compOffDocuments';
import { useCompOffOwnerKey, useCompOffResource } from '../hooks/useCompOffResource';

const ClaimForm = ({
  busy,
  error,
  onClose,
  onSubmit,
}: {
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: Record<string, unknown>) => Promise<boolean>;
}) => {
  const { currentTenant } = useTenant();
  const formId = useId();
  const [workedDate, setWorkedDate] = useState('');
  const [units, setUnits] = useState('1');
  const [reason, setReason] = useState('');
  return (
    <Modal
      isOpen
      title="Request comp-off credit"
      size="lg"
      onClose={onClose}
      isDismissible={!busy}
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} busy={busy} busyLabel="Submitting…">
            Send request
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({ workedDate, units, reason: reason.trim() || null }).then((saved) => {
            if (saved) onClose();
          });
        }}
      >
        <Input
          label="Date worked"
          type="date"
          required
          max={tenantDateKey(new Date(), currentTenant.timezone)}
          value={workedDate}
          disabled={busy}
          onChange={(event) => setWorkedDate(event.target.value)}
        />
        <label className="space-y-1 text-sm font-medium">
          Credit requested
          <select
            className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 md:min-h-9"
            value={units}
            disabled={busy}
            onChange={(event) => setUnits(event.target.value)}
          >
            <option value="1">Full day</option>
            <option value="0.5">Half day</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <Input
            label="Work completed / reason"
            value={reason}
            maxLength={1000}
            disabled={busy}
            onChange={(event) => setReason(event.target.value)}
            description="Your manager or HR will review the work and approve the credit."
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-status-danger sm:col-span-2">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};

const ClaimHistory = ({
  rows,
  busy,
  canSubmit,
  cancel,
}: {
  rows: CompOffClaim[];
  busy: boolean;
  canSubmit: boolean;
  cancel: (id: string) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[420px] text-left text-sm">
      <thead>
        <tr className="border-b border-line text-content-secondary">
          <th className="py-2">Date worked</th>
          <th>Credit</th>
          <th>Status</th>
          <th className="text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-line">
            <td className="py-2">{row.workedDate}</td>
            <td>{row.units} day</td>
            <td>
              <Badge size="sm">{row.status.toLowerCase()}</Badge>
              {row.rejectionReason && (
                <p className="mt-1 max-w-sm text-xs text-content-secondary">
                  {row.rejectionReason}
                </p>
              )}
            </td>
            <td className="text-right">
              {row.status === 'PENDING' && canSubmit && (
                <Button size="sm" variant="quiet" disabled={busy} onClick={() => cancel(row.id)}>
                  Withdraw
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {rows.length === 0 && (
      <p className="py-3 text-sm text-content-secondary">No comp-off credit requests.</p>
    )}
  </div>
);

const BalanceSummary = ({ balance }: { balance: CompOffSummary['compOffBalance'] }) => (
  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-5">
    {[
      ['Available', balance.availableUnits],
      ['Reserved', balance.reservedUnits],
      ['Used', balance.usedUnits],
      ['Expired', balance.expiredUnits],
      ['Earned', balance.earnedUnits],
    ].map(([label, value]) => (
      <div key={label}>
        <dt className="text-content-secondary">{label}</dt>
        <dd className="text-lg font-semibold tabular-nums">
          {value} <span className="text-xs font-normal">days</span>
        </dd>
      </div>
    ))}
  </dl>
);

const PolicyStatus = ({
  policy,
  canSubmit,
  disabled,
  open,
}: {
  policy: CompOffSummary['compOffPolicy'];
  canSubmit: boolean;
  disabled: boolean;
  open: () => void;
}) => {
  if (!policy)
    return (
      <p className="text-sm text-content-secondary">
        Comp-off requests are not enabled for you. Contact HR for policy details.
      </p>
    );
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-content-secondary">
        Credits expire {policy.validityDays} days after approval. Leave must be taken before the
        credit expires.
      </p>
      {canSubmit && (
        <Button size="sm" disabled={disabled} onClick={open}>
          Request credit
        </Button>
      )}
    </div>
  );
};

const CompOffContent = ({ canSubmit }: { canSubmit: boolean }) => {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const board = useCompOffResource<CompOffSummary>(MyCompOffDocument, { offset: page * 20 });
  const rows = board.data?.compOffClaims ?? [];
  const unavailable = board.loading || board.busy;
  return (
    <Card title="Comp-off balance">
      {board.loading && (
        <p role="status" className="text-sm text-content-secondary">
          Loading comp-off…
        </p>
      )}
      {board.error && !open && (
        <div role="alert" className="flex items-center gap-3 text-sm text-status-danger">
          {board.error}
          <Button size="sm" variant="outline" onClick={board.reload}>
            Retry
          </Button>
        </div>
      )}
      {board.data && (
        <div className="space-y-3">
          <BalanceSummary balance={board.data.compOffBalance} />
          <PolicyStatus
            policy={board.data.compOffPolicy}
            canSubmit={canSubmit}
            disabled={unavailable}
            open={() => setOpen(true)}
          />
          <details
            open={historyOpen}
            onToggle={(event) => setHistoryOpen(event.currentTarget.open)}
          >
            <summary className="cursor-pointer text-sm font-medium">Credit request history</summary>
            <ClaimHistory
              rows={rows}
              busy={unavailable}
              canSubmit={canSubmit}
              cancel={(claimId) => {
                void board.mutate(CancelCompOffDocument, { claimId });
              }}
            />
            <div className="mt-2 flex items-center justify-end gap-3">
              <Button
                size="sm"
                variant="quiet"
                disabled={page === 0 || unavailable}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-content-secondary">Page {page + 1}</span>
              <Button
                size="sm"
                variant="quiet"
                disabled={rows.length < 20 || unavailable}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </details>
        </div>
      )}
      {open && (
        <ClaimForm
          busy={board.busy}
          error={board.error}
          onClose={() => setOpen(false)}
          onSubmit={(input) => board.mutate(SubmitCompOffDocument, { input })}
        />
      )}
    </Card>
  );
};

const CompOffPanel = ({ canSubmit }: { canSubmit: boolean }) => {
  const owner = useCompOffOwnerKey();
  return <CompOffContent key={owner} canSubmit={canSubmit} />;
};
export default CompOffPanel;
