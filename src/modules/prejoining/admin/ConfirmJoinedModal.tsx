import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Select from '../../../components/common/Select';

import type {
  ConfirmJoinedDraft,
  DirectoryOption,
  PrejoiningCandidate,
} from './prejoiningAdminTypes';

export interface ConfirmModalProps {
  open: boolean;
  candidate: PrejoiningCandidate | null;
  draft: ConfirmJoinedDraft;
  error: string | null;
  busy: boolean;
  departments: DirectoryOption[];
  designations: DirectoryOption[];
  managers: DirectoryOption[];
  roles: DirectoryOption[];
  managerSearch: string;
  hasMoreManagers: boolean;
  onManagerSearch: (value: string) => void;
  onSearchManagers: () => void;
  onLoadMoreManagers: () => void;
  onChange: (next: ConfirmJoinedDraft) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmJoinedModal = (props: ConfirmModalProps) => {
  return (
    <Modal
      isOpen={props.open}
      onClose={props.onClose}
      isDismissible={!props.busy}
      title="Confirm joined"
      description="This creates the employee and login together. The new user must change the initial password."
      size="lg"
      footer={
        <>
          <Button variant="quiet" disabled={props.busy} onClick={props.onClose}>
            Cancel
          </Button>
          <Button busy={props.busy} onClick={props.onConfirm}>
            Create employee and login
          </Button>
        </>
      }
    >
      <fieldset disabled={props.busy} className="space-y-4">
        <p className="text-sm text-content-secondary">Candidate: {props.candidate?.email}</p>
        {props.error ? (
          <p role="alert" className="text-sm text-status-danger">
            {props.error}
          </p>
        ) : null}
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 [&>*]:min-w-0">
          <EmploymentFields {...props} />
          <ReportingManagerFields {...props} />
          <AccountFields {...props} />
        </div>
        <RoleFields {...props} />
      </fieldset>
    </Modal>
  );
};

const EmploymentFields = (props: ConfirmModalProps) => {
  const options = (rows: DirectoryOption[]) => [
    { value: '', label: 'None' },
    ...rows.map((row) => ({ value: row.id, label: row.label })),
  ];
  return (
    <>
      {' '}
      <Input
        label="Employee code"
        required
        fullWidth
        value={props.draft.employeeCode}
        onChange={(event) => props.onChange({ ...props.draft, employeeCode: event.target.value })}
      />
      <Input
        label="Date of joining"
        required
        type="date"
        fullWidth
        value={props.draft.dateOfJoining}
        onChange={(event) => props.onChange({ ...props.draft, dateOfJoining: event.target.value })}
      />
      <Select
        label="Department"
        fullWidth
        options={options(props.departments)}
        value={props.draft.departmentId}
        onChange={(event) => props.onChange({ ...props.draft, departmentId: event.target.value })}
      />
      <Select
        label="Designation"
        fullWidth
        options={options(props.designations)}
        value={props.draft.designationId}
        onChange={(event) => props.onChange({ ...props.draft, designationId: event.target.value })}
      />
    </>
  );
};

const ReportingManagerFields = (props: ConfirmModalProps) => {
  const options = (rows: DirectoryOption[]) => [
    { value: '', label: 'None' },
    ...rows.map((row) => ({ value: row.id, label: row.label })),
  ];
  return (
    <>
      {' '}
      <div className="min-w-0 space-y-2">
        <Input
          label="Find reporting manager"
          fullWidth
          value={props.managerSearch}
          onChange={(event) => props.onManagerSearch(event.target.value)}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={props.busy}
            onClick={props.onSearchManagers}
          >
            Search
          </Button>
          {props.hasMoreManagers ? (
            <Button
              size="sm"
              variant="quiet"
              disabled={props.busy}
              onClick={props.onLoadMoreManagers}
            >
              Load more
            </Button>
          ) : null}
        </div>
      </div>
      <Select
        label="Reporting manager"
        fullWidth
        options={options(props.managers)}
        value={props.draft.reportingManagerId}
        onChange={(event) =>
          props.onChange({ ...props.draft, reportingManagerId: event.target.value })
        }
      />
    </>
  );
};

const AccountFields = (props: ConfirmModalProps) => {
  return (
    <>
      {' '}
      <Input
        label="Employment type"
        fullWidth
        value={props.draft.employmentType}
        onChange={(event) => props.onChange({ ...props.draft, employmentType: event.target.value })}
      />
      <Input
        label="Username"
        required
        fullWidth
        value={props.draft.username}
        onChange={(event) => props.onChange({ ...props.draft, username: event.target.value })}
      />
      <Input
        label="Initial password"
        required
        type="password"
        fullWidth
        value={props.draft.initialPassword}
        onChange={(event) =>
          props.onChange({ ...props.draft, initialPassword: event.target.value })
        }
      />
      <Input
        label="Confirm password"
        required
        type="password"
        fullWidth
        value={props.draft.confirmPassword}
        onChange={(event) =>
          props.onChange({ ...props.draft, confirmPassword: event.target.value })
        }
      />
    </>
  );
};

const RoleFields = (props: ConfirmModalProps) => {
  return (
    <>
      {' '}
      <fieldset>
        <legend className="text-sm font-semibold">Application roles</legend>
        <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-2">
          {props.roles.map((role) => (
            <label
              key={role.id}
              className="flex min-h-10 min-w-0 items-center gap-2 rounded-md border border-line px-3 text-sm"
            >
              <input
                type="checkbox"
                checked={props.draft.roleIds.includes(role.id)}
                onChange={(event) =>
                  props.onChange({
                    ...props.draft,
                    roleIds: event.target.checked
                      ? [...props.draft.roleIds, role.id]
                      : props.draft.roleIds.filter((id) => id !== role.id),
                  })
                }
              />
              <span className="min-w-0 break-words">{role.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
};
