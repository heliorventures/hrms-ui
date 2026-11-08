import { PERMISSIONS } from '../../auth/permissions';
import type { PermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';

import { historicalPaymentEditor } from './historicalPaymentEditor';
import type { LoanEditorDefinition } from './loanForm';
import type { LoanAccount } from './loanTypes';

const LoanEarlierPaymentActions = ({
  account,
  permissions,
  onEdit,
}: {
  account: LoanAccount;
  permissions: PermissionService;
  onEdit: (definition: LoanEditorDefinition) => void;
}) => {
  if (!permissions.canScopedPermission(PERMISSIONS.loanCorrect, ['ALL'])) return null;
  return (
    <>
      {permissions.canScopedPermission(PERMISSIONS.loanRepay, ['ALL']) && (
        <Button variant="secondary" onClick={() => onEdit(historicalPaymentEditor(account, true))}>
          Review earlier repayment
        </Button>
      )}
      {permissions.canScopedPermission(PERMISSIONS.loanDisburse, ['ALL']) &&
        account.state === 'OPEN' &&
        account.fundingState !== 'CANCELLED' && (
          <Button
            variant="secondary"
            onClick={() => onEdit(historicalPaymentEditor(account, false))}
          >
            Review earlier disbursement
          </Button>
        )}
    </>
  );
};
export default LoanEarlierPaymentActions;
