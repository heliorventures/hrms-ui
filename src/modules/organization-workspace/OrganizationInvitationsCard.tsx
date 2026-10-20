import {
  AcceptOrganizationCompanyDocument,
  OrganizationInvitationsDocument,
} from '../../api/organization/graphql';
import { PERMISSIONS } from '../../auth/permissions';
import { createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';

import { documentItems, requiredString, sourceVersion } from './organizationDocuments';
import OrganizationQueryState from './OrganizationQueryState';
import type { OrganizationClientScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';
import { useOrganizationQuery } from './useOrganizationQuery';

const Invitations = ({
  access,
  refreshAccess,
}: {
  access: OrganizationClientScope;
  refreshAccess: () => void;
}) => {
  const query = useOrganizationQuery(`${access.ownerKey}|invitations`, async () => {
    const response = (await access.client.request(OrganizationInvitationsDocument))
      .organizationInvitations;
    return documentItems(response.schemaVersion, response.items);
  });
  const action = useOrganizationAction(() => {
    query.refresh();
    refreshAccess();
  });
  return (
    <Card title="Company invitations">
      <OrganizationQueryState
        {...query}
        onRetry={query.refresh}
        empty={query.data?.length === 0}
        emptyMessage="No pending invitations for your login company."
      >
        <ul className="space-y-3">
          {query.data?.map((invitation) => (
            <li
              key={requiredString(invitation, 'id')}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <p>
                {requiredString(invitation, 'organization_name')} invited {access.sourceCompanyName}
                .
              </p>
              <Button
                busy={action.busy}
                onClick={() => {
                  void action.run(() =>
                    access.client.request(AcceptOrganizationCompanyDocument, {
                      organizationId: requiredString(invitation, 'organization_id'),
                      expectedVersion: sourceVersion(invitation, 'organization_version'),
                      membershipId: requiredString(invitation, 'id'),
                      expectedMembershipVersion: sourceVersion(invitation),
                    })
                  );
                }}
              >
                Accept for this company
              </Button>
            </li>
          ))}
        </ul>
      </OrganizationQueryState>
      {action.error ? <p role="alert">{action.error}</p> : null}
    </Card>
  );
};

const OrganizationInvitationsCard = (props: {
  access: OrganizationClientScope;
  refreshAccess: () => void;
}) => {
  const { clientSession } = useAuth();
  if (!createPermissionService(clientSession).canScopedPermission(PERMISSIONS.roleManage, ['ALL']))
    return null;
  return <Invitations {...props} />;
};

export default OrganizationInvitationsCard;
