import { useState } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Modal from '../../../components/common/Modal';
import {
  ApprovedCompOffLeavesDocument,
  CancelApprovedCompOffLeaveDocument,
  type ApprovedCompOffLeave,
} from '../../leave/compOffDocuments';
import { useCompOffResource } from '../../leave/hooks/useCompOffResource';

const CancelConfirmation = ({
  row,
  busy,
  error,
  close,
  confirm,
}: {
  row: ApprovedCompOffLeave;
  busy: boolean;
  error: string | null;
  close: () => void;
  confirm: () => Promise<boolean>;
}) => (
  <Modal
    isOpen
    title="Cancel approved comp-off leave"
    size="md"
    isDismissible={!busy}
    onClose={close}
    footer={
      <>
        <Button variant="outline" disabled={busy} onClick={close}>
          Keep leave
        </Button>
        <Button
          variant="danger"
          busy={busy}
          onClick={() => {
            void confirm().then((saved) => {
              if (saved) close();
            });
          }}
        >
          Cancel leave
        </Button>
      </>
    }
  >
    <p className="text-sm">
      <strong>{row.employeeName}</strong> · {row.fromDate} to {row.toDate} · {row.daysRequested}{' '}
      day(s)
    </p>
    <p className="mt-3 text-sm text-content-secondary">
      The leave will be cancelled. Credits retain their original expiry date when restored.
    </p>
    {error && (
      <p role="alert" className="mt-3 text-sm text-status-danger">
        {error}
      </p>
    )}
  </Modal>
);

const ApprovedRows = ({
  rows,
  busy,
  cancel,
}: {
  rows: ApprovedCompOffLeave[];
  busy: boolean;
  cancel: (row: ApprovedCompOffLeave) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[480px] text-left text-sm">
      <thead>
        <tr className="border-b border-line text-content-secondary">
          <th className="py-2">Employee</th>
          <th>Leave dates</th>
          <th>Days</th>
          <th className="text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-line">
            <td className="py-3">
              <p className="font-medium">{row.employeeName}</p>
              <p className="text-xs text-content-secondary">{row.employeeCode}</p>
            </td>
            <td>
              {row.fromDate} — {row.toDate}
            </td>
            <td>{row.daysRequested}</td>
            <td className="text-right">
              <Button size="sm" variant="outline" disabled={busy} onClick={() => cancel(row)}>
                Cancel leave
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {rows.length === 0 && (
      <p className="py-3 text-sm text-content-secondary">
        No approved future comp-off leave is eligible for cancellation under the current policies.
      </p>
    )}
  </div>
);

const ApprovedCompOffLeaveSection = () => {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<ApprovedCompOffLeave | null>(null);
  const board = useCompOffResource<{ approvedCompOffLeaves: ApprovedCompOffLeave[] }>(
    ApprovedCompOffLeavesDocument,
    { offset: page * 20 }
  );
  const rows = board.data?.approvedCompOffLeaves ?? [];
  const busy = board.busy || board.loading;
  return (
    <Card title="Approved comp-off leave">
      {board.loading && (
        <p role="status" className="text-sm text-content-secondary">
          Loading approved leave…
        </p>
      )}
      {board.error && !selected && (
        <div role="alert" className="flex items-center gap-3 text-sm text-status-danger">
          {board.error}
          <Button size="sm" variant="outline" onClick={board.reload}>
            Retry
          </Button>
        </div>
      )}
      {board.data && (
        <>
          <ApprovedRows rows={rows} busy={busy} cancel={setSelected} />
          <div className="mt-2 flex justify-end gap-3">
            <Button
              size="sm"
              variant="quiet"
              disabled={page === 0 || busy}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <span className="self-center text-xs">Page {page + 1}</span>
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
      {selected && (
        <CancelConfirmation
          row={selected}
          busy={board.busy}
          error={board.error}
          close={() => setSelected(null)}
          confirm={() =>
            board.mutate(CancelApprovedCompOffLeaveDocument, { leaveRequestId: selected.id })
          }
        />
      )}
    </Card>
  );
};
export default ApprovedCompOffLeaveSection;
