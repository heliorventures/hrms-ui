import { useCallback, useState } from 'react';

import {
  LoanAccountDocument,
  LoanLedgerDocument,
  LoanPaymentsDocument,
  LoanSchedulesDocument,
} from '../../api/loans/graphql';
import { PERMISSIONS } from '../../auth/permissions';
import Button from '../../components/common/Button';
import FeedbackToast from '../../components/common/FeedbackToast';
import Modal from '../../components/common/Modal';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';

import LoanAccountSummary from './LoanAccountSummary';
import LoanEditor from './LoanEditor';
import LoanFinancialCheck from './LoanFinancialCheck';
import { ledgerColumns, paymentColumns, scheduleColumns } from './loanHistoryColumns';
import LoanHistoryPanel from './LoanHistoryPanel';
import LoanScheduleCard from './LoanScheduleCard';
import LoanStatementExport from './LoanStatementExport';
import LoanTermsSummary from './LoanTermsSummary';
import { useLoanAccess } from './useLoanAccess';
import { useLoanCorrection } from './useLoanCorrection';

interface Props {
  accountId: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}
const LoanAccountDetail = ({ accountId, onClose, onSaved }: Props) => {
  const client = useGraphClient();
  const { permissions } = useLoanAccess();
  const load = useCallback(
    () => client.request(LoanAccountDocument, { id: accountId }),
    [accountId, client]
  );
  const query = useRetainedQuery(load);
  const correction = useLoanCorrection(accountId);
  const [epoch, setEpoch] = useState(0);
  const account = query.data?.loanAccount;
  const refresh = async () => {
    setEpoch((value) => value + 1);
    await Promise.all([query.refreshChecked(), onSaved()]);
  };
  const onCorrect = permissions.canScopedPermission(PERMISSIONS.loanCorrect, ['ALL'])
    ? (row: Parameters<typeof correction.correct>[0]) => void correction.correct(row)
    : undefined;
  return (
    <Modal isOpen onClose={onClose} title={account?.loanNumber ?? 'Loan account'} size="xl">
      {query.error && (
        <FeedbackToast action={<Button onClick={() => void query.refresh()}>Retry</Button>}>
          {query.error}
        </FeedbackToast>
      )}
      {correction.error && <FeedbackToast>{correction.error}</FeedbackToast>}
      {query.phase === 'initial-loading' && <p role="status">Loading loan account...</p>}
      {account && (
        <div className="space-y-4">
          <LoanAccountSummary
            account={account}
            permissions={permissions}
            onEdit={correction.setEditor}
          />
          <LoanTermsSummary terms={account.terms} />
          {permissions.canScopedPermission(PERMISSIONS.loanManage, ['ALL']) && (
            <LoanFinancialCheck
              key={`check-${accountId}-${epoch}`}
              loanId={accountId}
              version={account.version}
            />
          )}
          <LoanScheduleCard key={`projection-${epoch}`} loanId={accountId} />
          {permissions.canScopedPermission(PERMISSIONS.loanExport, [
            'SELF',
            'TEAM',
            'DEPARTMENT',
            'ALL',
          ]) && <LoanStatementExport account={account} />}
          <LoanHistoryPanel
            key={`payments-${epoch}`}
            title="Payment history"
            document={LoanPaymentsDocument}
            field="loanPayments"
            loanId={accountId}
            columns={paymentColumns}
          />
          <LoanHistoryPanel
            key={`ledger-${epoch}`}
            title="Loan ledger"
            document={LoanLedgerDocument}
            field="loanLedger"
            loanId={accountId}
            columns={ledgerColumns(correction.correcting, onCorrect)}
          />
          <p className="text-xs text-content-secondary">
            Schedules are projections. Actual repayments appear in the ledger.
          </p>
          <LoanHistoryPanel
            key={`schedules-${epoch}`}
            title="Repayment arrangements"
            document={LoanSchedulesDocument}
            field="loanSchedules"
            loanId={accountId}
            columns={scheduleColumns}
          />
        </div>
      )}
      {correction.editor && (
        <LoanEditor
          definition={correction.editor}
          onClose={() => correction.setEditor(null)}
          onSaved={refresh}
        />
      )}
    </Modal>
  );
};
export default LoanAccountDetail;
