import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { createCommandIntent } from './organizationCommand';
import { companyBusinessReady } from './organizationCompanyLifecycle';
import { requiredString, sourceVersion, type OrganizationRecord } from './organizationDocuments';
import OrganizationPager from './OrganizationPager';
import OrganizationPayrollJobs from './OrganizationPayrollJobs';
import { payrollDraftPayload } from './organizationPayrollModel';
import OrganizationPayrollReview from './OrganizationPayrollReview';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import { latestSourceVersion, resourcePending } from './organizationResource';
import type { OrganizationCompany, OrganizationScope } from './organizationTypes';
import SourceCompanyLabel from './SourceCompanyLabel';
import { useOrganizationPayrollList } from './useOrganizationPayrollList';

const ScopedPayroll = ({
  scope,
  company,
}: {
  scope: OrganizationScope;
  company: OrganizationCompany;
}) => {
  const [selected, setSelected] = useState<OrganizationRecord | null>(null);
  const query = useOrganizationPayrollList(scope, company);
  const draft = (cycle: OrganizationRecord) => {
    void scope.commands.submit(
      scope.organization.id,
      company.name,
      createCommandIntent(
        company.membershipId,
        'payroll_draft',
        requiredString(cycle, 'id'),
        sourceVersion(cycle),
        payrollDraftPayload(cycle)
      )
    );
  };
  const actions = (cycle: OrganizationRecord) => {
    const id = requiredString(cycle, 'id');
    const pending = resourcePending(scope, company.membershipId, id);
    const changed =
      latestSourceVersion(scope, company.membershipId, id, sourceVersion(cycle)) >
      sourceVersion(cycle);
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pending || changed || cycle.status === 'FINALIZED'}
          onClick={() => draft(cycle)}
        >
          Generate source draft
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending || (cycle.draft_revision === null && !changed)}
          onClick={() => setSelected(cycle)}
        >
          Review source draft
        </Button>
      </div>
    );
  };
  return (
    <div className="space-y-4">
      <OrganizationPayrollJobs scope={scope} />
      <Card title={`Payroll processing: ${company.name}`}>
        <SourceCompanyLabel name={company.name} tenantId={company.tenantId} />
        <p className="my-3 text-sm text-content-secondary">
          Payroll actions require the source company&apos;s explicit payroll scope. Review the
          immutable source draft and its tax acknowledgements before finalizing.
        </p>
        <OrganizationQueryState {...query} onRetry={query.refresh}>
          <OrganizationRecordTable
            label="Source company payroll cycles"
            rows={query.data?.cycles ?? []}
            fields={[
              { key: 'name', label: 'Payroll cycle' },
              { key: 'year', label: 'Year' },
              { key: 'month', label: 'Month' },
              { key: 'status', label: 'Source status' },
              { key: 'draft_revision', label: 'Draft revision' },
              { key: 'finalization_block_reason', label: 'Finalization blocker' },
            ]}
            renderAction={actions}
          />
          <OrganizationPager
            {...query}
            busy={query.loading}
            hasNext={query.data?.hasNextPage ?? false}
          />
        </OrganizationQueryState>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => {
            setSelected(null);
            query.refresh();
          }}
        >
          Refresh source payroll cycles
        </Button>
      </Card>
      {query.data && selected ? (
        <OrganizationPayrollReview
          key={requiredString(selected, 'id')}
          scope={scope}
          company={company}
          cycle={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
};

const OrganizationPayroll = ({ scope }: { scope: OrganizationScope }) => {
  if (!scope.company)
    return (
      <Card>
        <p>Select the explicit business target company for payroll.</p>
      </Card>
    );
  if (!scope.company.capabilities.includes('payroll:manage'))
    return (
      <Card>
        <p>
          Your selected company does not grant payroll management. Organization administration alone
          does not grant payroll access.
        </p>
      </Card>
    );
  if (!companyBusinessReady(scope.company))
    return (
      <Card>
        <p>
          This company awaits active source membership confirmation. Ask its organization
          administrator to install the membership state and confirm its payroll grant.
        </p>
      </Card>
    );
  return <ScopedPayroll key={scope.company.membershipId} scope={scope} company={scope.company} />;
};

export default OrganizationPayroll;
