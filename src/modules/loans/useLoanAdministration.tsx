import { useState } from 'react';

import {
  LoanAccountsDocument,
  LoanPolicyDocument,
  LoanRequestQueueDocument,
  LoanRequestDecision,
} from '../../api/loans/graphql';
import { PERMISSIONS, type PermissionCode } from '../../auth/permissions';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { approvalEditor } from './approvalEditor';
import type { LoanEditorDefinition } from './loanForm';
import type { LoanAccount, LoanRequest } from './loanTypes';
import { paymentEditor, deductionEditor } from './paymentEditor';
import { useLoanAccess } from './useLoanAccess';
import { useLoanPage } from './useLoanPage';
import { useLoanSelection } from './useLoanSelection';

export function useLoanAdministration() {
  const { permissions } = useLoanAccess();
  const client = useGraphClient();
  const [tab, setTab] = useState('requests');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const requests = useLoanPage<LoanRequest>(
    LoanRequestQueueDocument,
    'loanRequestQueue',
    undefined,
    undefined,
    search,
    tab === 'requests' ? state : ''
  );
  const accounts = useLoanPage<LoanAccount>(
    LoanAccountsDocument,
    'loanAccounts',
    undefined,
    undefined,
    search,
    tab !== 'requests' ? state : ''
  );
  const [editor, setEditor] = useState<LoanEditorDefinition | null>(null);
  const [selected, setSelected] = useLoanSelection();
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    await Promise.all([requests.refreshChecked(), accounts.refreshChecked()]);
  };
  const openAccount = (account: LoanAccount) => {
    setError(null);
    const actions: Partial<
      Record<string, { permission: PermissionCode; definition: () => LoanEditorDefinition }>
    > = {
      disbursements: {
        permission: PERMISSIONS.loanDisburse,
        definition: () => paymentEditor(account, false),
      },
      repayments: {
        permission: PERMISSIONS.loanRepay,
        definition: () => paymentEditor(account, true),
      },
      deductions: {
        permission: PERMISSIONS.loanManage,
        definition: () => deductionEditor(account),
      },
    };
    const action = actions[tab];
    if (action && permissions.canScopedPermission(action.permission, ['ALL']))
      setEditor(action.definition());
    else setSelected(account.id);
  };
  const decide = async (request: LoanRequest, decision: LoanRequestDecision) => {
    setError(null);
    try {
      if (decision !== LoanRequestDecision.Approve) {
        setEditor(approvalEditor(request, null, decision));
        return;
      }
      const result = await client.request(LoanPolicyDocument, { id: request.policyId });
      setEditor(approvalEditor(request, result.loanPolicy, decision));
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    }
  };
  const requestActions = (request: LoanRequest) =>
    request.currentStepId &&
    permissions.canScopedPermission(PERMISSIONS.loanApprove, ['TEAM', 'DEPARTMENT', 'ALL']) && (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => void decide(request, LoanRequestDecision.Approve)}
        >
          Review
        </Button>
        <Button variant="quiet" onClick={() => void decide(request, LoanRequestDecision.Return)}>
          Return
        </Button>
        <Button variant="quiet" onClick={() => void decide(request, LoanRequestDecision.Reject)}>
          Reject
        </Button>
      </div>
    );
  const current = tab === 'requests' ? requests : accounts;

  return {
    tab,
    setTab,
    searchText,
    setSearchText,
    setSearch,
    state,
    setState,
    error,
    current,
    requests,
    accounts,
    editor,
    setEditor,
    selected,
    setSelected,
    refresh,
    openAccount,
    requestActions,
  };
}
