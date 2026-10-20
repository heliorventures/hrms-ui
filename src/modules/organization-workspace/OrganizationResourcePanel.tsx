import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import BusinessRecordDetails from './BusinessRecordDetails';
import { readOrganizationResource } from './organizationApi';
import { OrganizationDataError } from './organizationDataError';
import OrganizationDecisionForm from './OrganizationDecisionForm';
import {
  asRecord,
  requiredString,
  sourceVersion as confirmedSourceVersion,
} from './organizationDocuments';
import OrganizationManagerReviewForm from './OrganizationManagerReviewForm';
import OrganizationQueryState from './OrganizationQueryState';
import {
  detailOperation,
  latestSourceVersion,
  type OrganizationResourceReference,
} from './organizationResource';
import { readManagerReview } from './organizationReview';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import SourceCompanyLabel from './SourceCompanyLabel';
import { useOrganizationQuery } from './useOrganizationQuery';

interface Props {
  scope: OrganizationScope;
  reference: OrganizationResourceReference;
  onClose: () => void;
}
const OrganizationResourcePanel = ({ scope, reference, onClose }: Props) => {
  const operation = detailOperation(reference.kind);
  const sourceVersion = latestSourceVersion(
    scope,
    reference.membershipId,
    reference.resourceId,
    reference.version
  );
  const query = useOrganizationQuery(
    operation
      ? `${organizationScopeKey(scope)}|source|${reference.membershipId}|${reference.resourceId}|${sourceVersion}`
      : null,
    async () => {
      if (!operation) throw new OrganizationDataError('Unsupported source record.');
      const outcome = await readOrganizationResource(
        scope.client,
        {
          organizationId: scope.organization.id,
          membershipId: reference.membershipId,
          operation,
          resourceId: reference.resourceId,
          expectedVersion: sourceVersion,
        },
        scope.refreshAccess
      );
      if (
        outcome.status !== 'COMMITTED' ||
        outcome.resourceId !== reference.resourceId ||
        outcome.resourceVersion <= 0
      )
        throw new OrganizationDataError('Source details are awaiting confirmation.');
      const record = asRecord(outcome.result);
      const review =
        reference.kind === 'performance_participant' ? readManagerReview(record) : null;
      const id = review ? requiredString(review.review, 'id') : requiredString(record, 'id');
      if (id !== reference.resourceId)
        throw new OrganizationDataError('Source details did not match the selected resource.');
      return {
        record,
        review,
        version: confirmedSourceVersion({ version: outcome.resourceVersion }),
      };
    }
  );
  return (
    <Card title={`${reference.employeeName}: source record`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SourceCompanyLabel name={reference.companyName} tenantId={reference.tenantId} />
        <Button variant="outline" size="sm" onClick={query.refresh}>
          Refresh source details
        </Button>
        <Button variant="quiet" size="sm" onClick={onClose}>
          Close details
        </Button>
      </div>
      <OrganizationQueryState {...query} onRetry={query.refresh}>
        {query.data ? (
          <div className="space-y-3">
            <BusinessRecordDetails record={query.data.record} />
            {query.data.review ? (
              <OrganizationManagerReviewForm
                key={`${reference.resourceId}|${query.data.version}`}
                scope={scope}
                reference={reference}
                document={query.data.review}
                version={query.data.version}
              />
            ) : (
              <OrganizationDecisionForm
                scope={scope}
                reference={reference}
                record={query.data.record}
                version={query.data.version}
              />
            )}
          </div>
        ) : null}
      </OrganizationQueryState>
    </Card>
  );
};

export default OrganizationResourcePanel;
