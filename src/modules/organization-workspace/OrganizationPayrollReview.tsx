import { OrganizationOperation } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { readOrganizationResource } from './organizationApi';
import { OrganizationDataError } from './organizationDataError';
import { requiredString, sourceVersion, type OrganizationRecord } from './organizationDocuments';
import { readPayrollDraft } from './organizationPayrollModel';
import OrganizationQueryState from './OrganizationQueryState';
import { latestSourceVersion } from './organizationResource';
import OrganizationReviewedPayroll from './OrganizationReviewedPayroll';
import {
  organizationScopeKey,
  type OrganizationCompany,
  type OrganizationScope,
} from './organizationTypes';
import { useOrganizationQuery } from './useOrganizationQuery';

interface Props {
  scope: OrganizationScope;
  company: OrganizationCompany;
  cycle: OrganizationRecord;
  onClose: () => void;
}
const OrganizationPayrollReview = ({ scope, company, cycle, onClose }: Props) => {
  const cycleId = requiredString(cycle, 'id');
  const version = latestSourceVersion(scope, company.membershipId, cycleId, sourceVersion(cycle));
  const query = useOrganizationQuery(
    `${organizationScopeKey(scope)}|payroll-review|${cycleId}|${version}`,
    async () => {
      const result = await readOrganizationResource(
        scope.client,
        {
          organizationId: scope.organization.id,
          membershipId: company.membershipId,
          operation: OrganizationOperation.PayrollDetail,
          resourceId: cycleId,
          expectedVersion: version,
          payload: { cycle_id: cycleId, first: 1 },
        },
        scope.refreshAccess
      );
      if (
        result.status !== 'COMMITTED' ||
        result.resourceId !== cycleId ||
        result.resourceVersion <= 0
      )
        throw new OrganizationDataError('The source reviewed payroll draft is not confirmed.');
      return {
        draft: readPayrollDraft(result.result, cycleId),
        version: sourceVersion({ version: result.resourceVersion }),
      };
    }
  );
  return (
    <div className="space-y-3">
      <Card>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={query.refresh}>
            Reload reviewed draft from source
          </Button>
          <Button variant="quiet" onClick={onClose}>
            Close reviewed draft
          </Button>
        </div>
      </Card>
      <OrganizationQueryState {...query} onRetry={query.refresh}>
        {query.data ? (
          <OrganizationReviewedPayroll
            key={`${cycleId}|${query.data.draft.revision}|${query.data.draft.fingerprint}|${query.data.version}`}
            scope={scope}
            company={company}
            cycleId={cycleId}
            version={query.data.version}
            draft={query.data.draft}
          />
        ) : null}
      </OrganizationQueryState>
    </div>
  );
};

export default OrganizationPayrollReview;
