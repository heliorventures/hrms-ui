import { useState } from 'react';

import {
  OrganizationIdentityDocument,
  RegisterOrganizationIdentityDocument,
  RevokeOrganizationIdentityDocument,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import type { OrganizationClientScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';
import { useOrganizationQuery } from './useOrganizationQuery';

const OrganizationIdentityCard = ({
  access,
  refreshAccess,
}: {
  access: OrganizationClientScope;
  refreshAccess: () => void;
}) => {
  const [confirm, setConfirm] = useState(false);
  const identity = useOrganizationQuery(
    `${access.ownerKey}|identity`,
    async () => (await access.client.request(OrganizationIdentityDocument)).myOrganizationIdentity
  );
  const action = useOrganizationAction(() => {
    identity.refresh();
    refreshAccess();
    setConfirm(false);
  });
  return (
    <Card title="Organization identity">
      <p className="mb-2 text-sm text-content-secondary">
        Your login remains with {access.sourceCompanyName}. Organization access requires a verified
        identity link and current company grants.
      </p>
      {identity.loading ? <p role="status">Checking identity link…</p> : null}
      {identity.error ? (
        <p className="mb-2 text-sm">
          The organization identity link could not be loaded. Retry, or register this source account
          if it has not been linked.
        </p>
      ) : null}
      {identity.data ? (
        <div className="space-y-2">
          <p className="break-all text-sm">Principal reference: {identity.data.principalId}</p>
          <Button variant="outline" onClick={() => setConfirm(true)} disabled={action.busy}>
            Unlink this account
          </Button>
          {confirm ? (
            <div className="space-y-2 rounded border border-status-warning p-3">
              <p>Unlinking immediately removes organization access from this login.</p>
              <Button
                variant="danger"
                busy={action.busy}
                onClick={() => {
                  const version = identity.data?.loginLinkVersion;
                  if (version !== undefined)
                    void action.run(() =>
                      access.client.request(RevokeOrganizationIdentityDocument, {
                        expectedLinkVersion: version,
                      })
                    );
                }}
              >
                Confirm unlink
              </Button>
              <Button variant="quiet" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <Button
          disabled={identity.loading}
          busy={action.busy}
          onClick={() => {
            void action.run(() => access.client.request(RegisterOrganizationIdentityDocument));
          }}
        >
          Register this account
        </Button>
      )}
      {action.error ? <p role="alert">{action.error}</p> : null}
    </Card>
  );
};

export default OrganizationIdentityCard;
