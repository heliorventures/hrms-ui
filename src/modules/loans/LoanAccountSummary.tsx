import { PERMISSIONS } from '../../auth/permissions';
import type { PermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';

import { cancelFundingEditor } from './cancelFundingEditor';
import LoanEarlierPaymentActions from './LoanEarlierPaymentActions';
import type { LoanEditorDefinition } from './loanForm';
import type { LoanAccount } from './loanTypes';
import { paymentEditor, deductionEditor, overrideEditor } from './paymentEditor';

interface Props {
  account: LoanAccount;
  permissions: PermissionService;
  onEdit: (definition: LoanEditorDefinition) => void;
}
const LoanAccountSummary = ({ account, permissions, onEdit }: Props) => {
  const figures = [
    ['Approved', account.approvedPrincipal],
    ['Disbursed', account.disbursed],
    ['Repaid', account.repaid],
    ['Posted balance', account.outstanding],
    ['Principal', account.principal],
    ['Posted interest', account.interest],
    ['Unapplied credit', account.unappliedCredit],
  ];
  return (
    <>
      <p className="text-sm">
        {account.employeeName} · {account.employeeCode} · {account.purpose}
      </p>
      <dl className="grid grid-cols-2 gap-3 rounded-lg bg-canvas p-3 text-sm sm:grid-cols-4">
        {figures.map(([label, value]) => (
          <div key={label}>
            <dt className="text-content-secondary">{label}</dt>
            <dd className="font-medium tabular-nums">
              {account.currency} {value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-content-secondary">
        Funding status: {account.fundingState.replace(/_/g, ' ')}. Posted interest excludes unposted
        earned and future interest.
      </p>
      <div className="flex flex-wrap gap-2">
        <LoanEarlierPaymentActions account={account} permissions={permissions} onEdit={onEdit} />
        {permissions.canScopedPermission(PERMISSIONS.loanDisburse, ['ALL']) &&
          account.state === 'OPEN' && (
            <Button
              variant="secondary"
              disabled={account.fundingState === 'CANCELLED'}
              onClick={() => onEdit(paymentEditor(account, false))}
            >
              Record disbursement
            </Button>
          )}
        {permissions.canScopedPermission(PERMISSIONS.loanRepay, ['ALL']) && (
          <Button variant="secondary" onClick={() => onEdit(paymentEditor(account, true))}>
            Record repayment
          </Button>
        )}
        {permissions.canScopedPermission(PERMISSIONS.loanManage, ['ALL']) && (
          <>
            {account.state === 'OPEN' &&
              ['UNFUNDED', 'PARTIALLY_FUNDED'].includes(account.fundingState) && (
                <Button variant="secondary" onClick={() => onEdit(cancelFundingEditor(account))}>
                  Cancel unused funding
                </Button>
              )}
            <Button variant="secondary" onClick={() => onEdit(deductionEditor(account))}>
              Configure deduction
            </Button>
            <Button variant="secondary" onClick={() => onEdit(overrideEditor(account))}>
              Monthly override
            </Button>
          </>
        )}
      </div>
    </>
  );
};
export default LoanAccountSummary;
