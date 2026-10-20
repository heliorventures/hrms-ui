import { useState } from 'react';

import { ChangeOrganizationRelationshipManagerDocument } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { requiredString, sourceVersion, type OrganizationRecord } from './organizationDocuments';
import OrganizationEmploymentPicker from './OrganizationEmploymentPicker';
import type { OrganizationScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';

interface Props {
  scope: OrganizationScope;
  assignment: OrganizationRecord;
  graphVersion: number;
  onClose: () => void;
}
const OrganizationRelationshipManagerEditor = ({
  scope,
  assignment,
  graphVersion,
  onClose,
}: Props) => {
  const [manager, setManager] = useState<OrganizationRecord | null>(null);
  const action = useOrganizationAction(scope.refreshAccess);
  const save = () => {
    if (manager)
      void action.run(() =>
        scope.client.request(ChangeOrganizationRelationshipManagerDocument, {
          organizationId: scope.organization.id,
          assignmentId: requiredString(assignment, 'id'),
          expectedVersion: sourceVersion(assignment),
          expectedGraphVersion: graphVersion,
          managerEmploymentRefId: requiredString(manager, 'id'),
        })
      );
  };
  return (
    <Card title={`Change manager: ${requiredString(assignment, 'subject_display_name')}`}>
      <p className="mb-3 text-sm text-content-secondary">
        Choose the replacement manager for this assignment. The source keeps the current installed
        manager until the replacement is installed and confirmed. Replacing the manager does not
        open a temporary reporting gap.
      </p>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <OrganizationEmploymentPicker
          scope={scope}
          label="Replacement manager employment"
          value={manager ? requiredString(manager, 'id') : ''}
          onChange={setManager}
        />
        {action.error ? <p role="alert">{action.error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            busy={action.busy}
            disabled={
              !manager ||
              manager.id === assignment.manager_employment_ref_id ||
              manager.id === assignment.subject_employment_ref_id
            }
          >
            Reserve manager replacement
          </Button>
          <Button variant="quiet" disabled={action.busy} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default OrganizationRelationshipManagerEditor;
