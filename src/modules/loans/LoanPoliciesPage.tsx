import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  LoanApprovalWorkflowsDocument,
  LoanPolicyVersionsDocument,
  type LoanPolicyVersionsQuery,
} from '../../api/loans/graphql';
import { PERMISSIONS } from '../../auth/permissions';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';

import LoanEditor from './LoanEditor';
import type { LoanEditorDefinition } from './loanForm';
import LoanPager from './LoanPager';
import { loanTableState } from './loanTableState';
import { policyColumns } from './policyColumns';
import { policyEditor, retireEditor } from './policyEditor';
import { useLoanAccess } from './useLoanAccess';
import { useLoanOptions } from './useLoanOptions';
import { useLoanPage } from './useLoanPage';

type PolicyVersion = LoanPolicyVersionsQuery['loanPolicyVersions']['nodes'][number];
const LoanPoliciesWorkspace = () => {
  const navigate = useNavigate();
  const { permissions } = useLoanAccess();
  const policies = useLoanPage<PolicyVersion>(LoanPolicyVersionsDocument, 'loanPolicyVersions');
  const workflows = useLoanOptions<{ id: string; name: string }>(
    LoanApprovalWorkflowsDocument,
    'loanApprovalWorkflows'
  );
  const [editor, setEditor] = useState<LoanEditorDefinition | null>(null);
  return (
    <div className="space-y-4">
      <PageHeader
        title="Loan policies"
        description="Publish reviewed company policy versions. Existing loans retain their approved policy and terms."
        actions={
          <Button
            disabled={!workflows.data?.nodes.length}
            onClick={() => setEditor(policyEditor(workflows.data?.nodes ?? []))}
          >
            Publish policy
          </Button>
        }
      />
      <Card>
        <DataTable
          ariaLabel="Company loan policy versions"
          rows={policies.data?.nodes ?? []}
          getRowId={(row) => row.id}
          state={loanTableState(
            policies.phase === 'initial-loading',
            policies.error,
            policies.data?.nodes.length ?? 0
          )}
          stateMessage={policies.error ?? undefined}
          columns={policyColumns(
            (row) => setEditor(policyEditor(workflows.data?.nodes ?? [], row)),
            (row) => setEditor(retireEditor(row))
          )}
        />
        <LoanPager
          page={policies.page}
          hasNext={policies.data?.pageInfo.hasNextPage ?? false}
          disabled={policies.phase === 'initial-loading'}
          onNext={policies.next}
          onPrevious={policies.previous}
        />
      </Card>
      <Card title="Approval workflows">
        {workflows.error && <p role="alert">{workflows.error}</p>}
        <p className="text-sm text-content-secondary">
          Only active loan workflows with configured loan approvers can be selected. Configure a
          loan workflow using the approval rules configuration when none is available.
        </p>
        {permissions.canScopedPermission(PERMISSIONS.workflowManage, ['ALL']) && (
          <Button variant="secondary" onClick={() => navigate('/workplace/workflows?domain=loans')}>
            Configure loan approval rules
          </Button>
        )}
      </Card>
      {editor && (
        <LoanEditor
          definition={editor}
          onClose={() => setEditor(null)}
          onSaved={policies.refreshChecked}
        />
      )}
    </div>
  );
};
const LoanPoliciesPage = () => {
  const { ownerKey } = useLoanAccess();
  return <LoanPoliciesWorkspace key={ownerKey} />;
};
export default LoanPoliciesPage;
