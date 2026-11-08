import { useState } from 'react';

import {
  MyLoansDocument,
  MyLoanRequestsDocument,
  LoanPoliciesDocument,
} from '../../api/loans/graphql';
import { PERMISSIONS } from '../../auth/permissions';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';

import LoanAccountDetail from './LoanAccountDetail';
import LoanAccountTable from './LoanAccountTable';
import LoanEditor from './LoanEditor';
import type { LoanEditorDefinition } from './loanForm';
import LoanPager from './LoanPager';
import LoanRequestPolicyStatus from './LoanRequestPolicyStatus';
import LoanRequestTable from './LoanRequestTable';
import type { LoanAccount, LoanPolicy, LoanRequest } from './loanTypes';
import { requestEditor, withdrawEditor } from './requestEditor';
import { useLoanAccess } from './useLoanAccess';
import { useLoanOptions } from './useLoanOptions';
import { useLoanPage } from './useLoanPage';
import { useLoanSelection } from './useLoanSelection';

const MyLoansWorkspace = () => {
  const { permissions } = useLoanAccess();
  const accounts = useLoanPage<LoanAccount>(MyLoansDocument, 'myLoans');
  const requests = useLoanPage<LoanRequest>(MyLoanRequestsDocument, 'myLoanRequests');
  const policies = useLoanOptions<LoanPolicy>(LoanPoliciesDocument, 'loanPolicies');
  const [editor, setEditor] = useState<LoanEditorDefinition | null>(null);
  const [selected, setSelected] = useLoanSelection();
  const submits = permissions.canScopedPermission(PERMISSIONS.loanSubmit, ['SELF', 'ALL']);
  const refresh = async () => {
    await Promise.all([accounts.refreshChecked(), requests.refreshChecked()]);
  };
  const requestActions = (request: LoanRequest) => (
    <div className="flex flex-wrap gap-2">
      {submits && ['DRAFT', 'RETURNED'].includes(request.state) && (
        <Button
          variant="secondary"
          onClick={() => setEditor(requestEditor(policies.data?.nodes ?? [], false, request))}
        >
          Edit and submit
        </Button>
      )}
      {submits && ['DRAFT', 'RETURNED', 'SUBMITTED', 'UNDER_REVIEW'].includes(request.state) && (
        <Button variant="quiet" onClick={() => setEditor(withdrawEditor(request))}>
          Withdraw
        </Button>
      )}
    </div>
  );
  return (
    <div className="space-y-4">
      <PageHeader
        title="My loans"
        description="Track approved loans, actual disbursements and posted repayments. Future schedules are projections."
        actions={
          submits && (
            <Button
              disabled={!policies.data?.nodes.length}
              onClick={() => setEditor(requestEditor(policies.data?.nodes ?? [], false))}
            >
              Request a loan
            </Button>
          )
        }
      />
      <Card title="Loan accounts">
        <LoanAccountTable
          rows={accounts.data?.nodes ?? []}
          loading={accounts.phase === 'initial-loading'}
          error={accounts.error}
          onOpen={(account) => setSelected(account.id)}
        />
        <LoanPager
          page={accounts.page}
          hasNext={accounts.data?.pageInfo.hasNextPage ?? false}
          disabled={accounts.phase === 'initial-loading'}
          onNext={accounts.next}
          onPrevious={accounts.previous}
        />
      </Card>
      <Card title="My requests">
        <LoanRequestTable
          rows={requests.data?.nodes ?? []}
          loading={requests.phase === 'initial-loading'}
          error={requests.error}
          actions={requestActions}
        />
        <LoanPager
          page={requests.page}
          hasNext={requests.data?.pageInfo.hasNextPage ?? false}
          disabled={requests.phase === 'initial-loading'}
          onNext={requests.next}
          onPrevious={requests.previous}
        />
        {submits && (
          <Button
            variant="secondary"
            disabled={!policies.data?.nodes.length}
            onClick={() => setEditor(requestEditor(policies.data?.nodes ?? [], true))}
          >
            Save a request draft
          </Button>
        )}
        <LoanRequestPolicyStatus
          phase={policies.phase}
          error={policies.error}
          count={policies.data?.nodes.length ?? 0}
          onRetry={() => void policies.refresh()}
        />
      </Card>
      {editor && (
        <LoanEditor definition={editor} onClose={() => setEditor(null)} onSaved={refresh} />
      )}
      {selected && (
        <LoanAccountDetail
          accountId={selected}
          onClose={() => setSelected(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
};
const MyLoansPage = () => {
  const { ownerKey } = useLoanAccess();
  return <MyLoansWorkspace key={ownerKey} />;
};
export default MyLoansPage;
