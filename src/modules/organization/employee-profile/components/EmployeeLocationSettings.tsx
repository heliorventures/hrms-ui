import { useEffect, useState } from 'react';

import { authorizationStateKey } from '../../../../auth/permissionService';
import Button from '../../../../components/common/Button';
import Card from '../../../../components/common/Card';
import FeedbackToast from '../../../../components/common/FeedbackToast';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  AssignEmployeeLocationDocument,
  EmployeeLocationAssignmentDocument,
} from '../../../admin/companyLocationDocuments';
import CompanyLocationPicker from '../../../admin/CompanyLocationPicker';
import { useCompanyMutation } from '../../../admin/useCompanyMutation';
import { useCompanyResource } from '../../../admin/useCompanyResource';

const LocationEditor = ({
  employeeId,
  onChanged,
}: {
  employeeId: string;
  onChanged?: () => void;
}) => {
  const resource = useCompanyResource(EmployeeLocationAssignmentDocument, { employeeId });
  const mutation = useCompanyMutation();
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);
  const assignment = resource.data?.employeeLocationAssignment;
  useEffect(() => {
    if (assignment) setValue(assignment.locationId ?? '');
  }, [assignment]);
  const save = async () => {
    if (!assignment) return;
    if (
      await mutation.run(AssignEmployeeLocationDocument, {
        input: {
          employeeId,
          locationId: value || null,
          effectiveDate: assignment.businessDate,
          expectedRevision: assignment.revision,
        },
      })
    ) {
      setSaved(true);
      resource.reload();
      onChanged?.();
    }
  };
  return (
    <Card title="Employee Location">
      <div
        className="space-y-3"
        data-tour-anchor="employee-profile.location"
        data-guidance-dirty={!!assignment && value !== (assignment.locationId ?? '')}
      >
        {resource.loading ? <p>Loading assignment...</p> : null}
        {assignment ? (
          <>
            <p className="text-sm">
              Current: {assignment.locationName ?? 'Company default'} · effective{' '}
              {assignment.effectiveFrom ?? 'no dated assignment'}. Changes take effect today (
              {assignment.businessDate}).
            </p>
            <CompanyLocationPicker
              value={value}
              onChange={(next) => {
                setValue(next);
                setSaved(false);
              }}
              selectedName={assignment.locationName}
              disabled={mutation.busy}
            />
            <Button
              disabled={
                mutation.busy || resource.loading || value === (assignment.locationId ?? '')
              }
              onClick={() => void save()}
            >
              Assign Location Today
            </Button>
          </>
        ) : null}
        {mutation.error || resource.error ? (
          <FeedbackToast variant={'error'}>{mutation.error ?? resource.error}</FeedbackToast>
        ) : null}
        <Button variant="outline" disabled={mutation.busy} onClick={resource.reload}>
          Reload Assignment
        </Button>
        {saved ? <FeedbackToast variant={'info'}>Location assignment saved.</FeedbackToast> : null}
      </div>
    </Card>
  );
};
const EmployeeLocationSettings = (props: { employeeId: string; onChanged?: () => void }) => {
  const auth = useAuth();
  return (
    <LocationEditor
      key={`${auth.tenantId}:${auth.user?.id}:${authorizationStateKey(auth.clientSession)}:${props.employeeId}`}
      {...props}
    />
  );
};
export default EmployeeLocationSettings;
