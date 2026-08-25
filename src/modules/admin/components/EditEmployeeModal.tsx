import { useCallback, useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useAuth } from '../../../contexts/AuthContext';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { UI_ACTION_TEXT, UI_FIELD_LABELS, UI_STATUS_TEXT } from '../../../constants/uiText';
import { type UpdateEmployeeInput } from '../../../api/graphql/graphql';
import {
  buildDepartmentOptions,
  buildDesignationOptions,
  buildManagerOptions,
  EMPLOYEE_STATUS_OPTIONS,
  LOADING_EMPLOYEE_FORM_OPTION,
  type SelectOption,
} from '../employeeFormOptions';

const EmployeeModalDirectoryDocument = `
  query ClientOpsOrgListsForEmployeeModal($dlim: Int! = 100, $glim: Int! = 100, $elim: Int! = 100) {
    departments(limit: $dlim) {
      id
      name
      code
    }
    designations(limit: $glim) {
      id
      title
    }
    employees(limit: $elim) {
      id
      employeeCode
      fullName
    }
  }
`;

const EmployeeModalAdminDirectoryDocument = `
  query ClientOpsOrgListsForEmployeeModal(
    $dlim: Int! = 100
    $glim: Int! = 100
    $elim: Int! = 100
    $rlim: Int! = 80
  ) {
    departments(limit: $dlim) {
      id
      name
      code
    }
    designations(limit: $glim) {
      id
      title
    }
    employees(limit: $elim) {
      id
      employeeCode
      fullName
    }
    tenantDirectoryRoles(limit: $rlim) {
      id
      name
      isSystemRole
    }
  }
`;

const ProvisionEmployeeLoginDocument = `
  mutation ProvisionEmployeeLogin($input: ProvisionEmployeeLoginInput!) {
    provisionEmployeeLogin(input: $input) {
      id
      userId
      linkedUserUsername
      linkedUserEmail
    }
  }
`;

const ResetEmployeePasswordDocument = `
  mutation ResetEmployeePassword($input: ResetEmployeePasswordInput!) {
    resetEmployeePassword(input: $input)
  }
`;

const UpdateEmployeeWithLoginEmailDocument = `
  mutation UpdateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
      id
      employeeCode
      fullName
      status
      dateOfJoining
      departmentId
      designationId
      employmentType
      reportingManagerId
      linkedUserEmail
    }
  }
`;

export interface EditEmployeeRow {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  employmentType?: string | null;
  dateOfJoining: string;
  departmentId?: string | null;
  designationId?: string | null;
  reportingManagerId?: string | null;
  userId?: string | null;
  linkedUserEmail?: string | null;
  linkedUserUsername?: string | null;
}

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EditEmployeeRow | null;
  onUpdated: () => void;
}

const EditEmployeeModal = ({ isOpen, onClose, employee, onUpdated }: EditEmployeeModalProps) => {
  const client = useGraphClient('client');
  const { can } = useAuth();
  const canManageLoginAccounts = can('role:manage');
  const canReadRoleDirectory = can('role:manage');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [employmentType, setEmploymentType] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [accountUsername, setAccountUsername] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountConfirmPassword, setAccountConfirmPassword] = useState('');
  const [accountRoleId, setAccountRoleId] = useState('');
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [deptOptions, setDeptOptions] = useState<SelectOption[]>([]);
  const [desigOptions, setDesigOptions] = useState<SelectOption[]>([]);
  const [managerOptions, setManagerOptions] = useState<SelectOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
  const [orgLoadError, setOrgLoadError] = useState<string | null>(null);

  const loadOrg = useCallback(async () => {
    if (!isOpen) return;
    setOrgLoadError(null);
    try {
      const res = await client.request<{
        departments: { id: string; name: string; code: string }[];
        designations: { id: string; title: string }[];
        employees: { id: string; employeeCode: string; fullName: string }[];
        tenantDirectoryRoles?: { id: string; name: string; isSystemRole: boolean }[];
      }>(
        canReadRoleDirectory ? EmployeeModalAdminDirectoryDocument : EmployeeModalDirectoryDocument,
        { dlim: 100, glim: 100, elim: 100, rlim: 80 }
      );
      setDeptOptions(buildDepartmentOptions(res.departments ?? []));
      setDesigOptions(buildDesignationOptions(res.designations ?? []));
      setManagerOptions(buildManagerOptions(res.employees ?? [], employee?.id));
      setRoleOptions([
        { value: '', label: 'No role assigned' },
        ...((res.tenantDirectoryRoles ?? []).map((role) => ({
          value: role.id,
          label: role.isSystemRole ? `${role.name} (system)` : role.name,
        }))),
      ]);
    } catch (e) {
      setOrgLoadError(graphQlUserMessage(e));
    }
  }, [canReadRoleDirectory, client, isOpen, employee?.id]);

  useEffect(() => {
    void loadOrg();
  }, [loadOrg]);

  useEffect(() => {
    if (!employee || !isOpen) return;
    setFirstName(employee.firstName ?? '');
    setLastName(employee.lastName ?? '');
    setStatus(employee.status || 'ACTIVE');
    setEmploymentType(employee.employmentType ?? '');
    setDepartmentId(employee.departmentId ?? '');
    setDesignationId(employee.designationId ?? '');
    setReportingManagerId(employee.reportingManagerId ?? '');
    setAccountUsername(employee.linkedUserUsername ?? '');
    setAccountEmail(employee.linkedUserEmail ?? '');
    setAccountPassword('');
    setAccountConfirmPassword('');
    setAccountRoleId('');
    setAccountMessage(null);
    setFormError(null);
  }, [employee, isOpen]);

  const validateAccountPassword = () => {
    if (accountPassword.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return false;
    }
    if (accountPassword !== accountConfirmPassword) {
      setFormError('Password and confirmation do not match.');
      return false;
    }
    return true;
  };

  const handleProvisionLogin = async () => {
    if (!employee) return;
    setFormError(null);
    setAccountMessage(null);
    if (!accountUsername.trim()) {
      setFormError('Username is required to provision login.');
      return;
    }
    if (!validateAccountPassword()) return;
    setAccountBusy(true);
    try {
      await client.request(ProvisionEmployeeLoginDocument, {
        input: {
          employeeId: employee.id,
          username: accountUsername.trim(),
          email: accountEmail.trim() || undefined,
          initialPassword: accountPassword,
          roleIds: accountRoleId ? [accountRoleId] : [],
        },
      });
      setAccountPassword('');
      setAccountConfirmPassword('');
      setAccountMessage('Login provisioned. The employee must change the temporary password at next login.');
      onUpdated();
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    } finally {
      setAccountBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!employee) return;
    setFormError(null);
    setAccountMessage(null);
    if (!validateAccountPassword()) return;
    setAccountBusy(true);
    try {
      await client.request(ResetEmployeePasswordDocument, {
        input: {
          employeeId: employee.id,
          newPassword: accountPassword,
        },
      });
      setAccountPassword('');
      setAccountConfirmPassword('');
      setAccountMessage('Password reset. Active sessions were revoked and the employee must change it at next login.');
      onUpdated();
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    } finally {
      setAccountBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const input: Record<string, unknown> = {
        id: employee.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        status,
      };
      const et = employmentType.trim();
      if (et) {
        input.employmentType = et;
      }
      if (departmentId) {
        input.departmentId = departmentId;
      }
      if (designationId) {
        input.designationId = designationId;
      }
      input.reportingManagerId = reportingManagerId || null;
      if (canManageLoginAccounts && employee.userId && accountEmail.trim() !== (employee.linkedUserEmail ?? '')) {
        input.linkedUserEmail = accountEmail.trim();
      }
      await client.request(UpdateEmployeeWithLoginEmailDocument, { input: input as UpdateEmployeeInput });
      onUpdated();
      onClose();
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Employee - ${employee.employeeCode}`}>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
        {orgLoadError && (
          <p className="text-sm text-amber-800 dark:text-amber-200">{orgLoadError}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Employee code and date of joining are not editable here (backend limitation).
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label={UI_FIELD_LABELS.employeeCode} value={employee.employeeCode} fullWidth disabled />
          <Input
            type="date"
            label={UI_FIELD_LABELS.dateOfJoining}
            value={employee.dateOfJoining.slice(0, 10)}
            fullWidth
            disabled
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label={`${UI_FIELD_LABELS.firstName} *`}
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
            fullWidth
            required
          />
          <Input
            label={`${UI_FIELD_LABELS.lastName} *`}
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
            }}
            fullWidth
            required
          />
        </div>
        <Select
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
          }}
          options={EMPLOYEE_STATUS_OPTIONS}
          fullWidth
        />
        <Input
          label="Employment Type"
          value={employmentType}
          onChange={(e) => {
            setEmploymentType(e.target.value);
          }}
          fullWidth
          placeholder="e.g. PERMANENT"
        />
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
          <p>
            Linked login:{' '}
            <span className="font-medium">
              {employee.linkedUserUsername || employee.linkedUserEmail || employee.userId || 'Not provisioned'}
            </span>
          </p>
          {accountMessage && (
            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">{accountMessage}</p>
          )}
          {canManageLoginAccounts ? (
            <div className="mt-3 space-y-3">
            {employee.userId && (
              <Input
                label="Login Email"
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                fullWidth
                autoComplete="off"
                placeholder="optional"
              />
            )}
            {!employee.userId && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Username *"
                  value={accountUsername}
                  onChange={(e) => setAccountUsername(e.target.value)}
                  fullWidth
                  autoComplete="off"
                  placeholder="mobile number or unique name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  fullWidth
                  autoComplete="off"
                  placeholder="optional"
                />
              </div>
            )}
            {!employee.userId && canReadRoleDirectory && (
              <Select
                label="Initial Role"
                value={accountRoleId}
                onChange={(e) => setAccountRoleId(e.target.value)}
                options={roleOptions.length ? roleOptions : [{ value: '', label: 'No role assigned' }]}
                fullWidth
              />
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                label={employee.userId ? 'New Password *' : 'Initial Password *'}
                type="password"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                fullWidth
                minLength={8}
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password *"
                type="password"
                value={accountConfirmPassword}
                onChange={(e) => setAccountConfirmPassword(e.target.value)}
                fullWidth
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={accountBusy}
              onClick={() => {
                if (employee.userId) {
                  void handleResetPassword();
                } else {
                  void handleProvisionLogin();
                }
              }}
            >
              {accountBusy
                ? 'Saving...'
                : employee.userId
                  ? 'Reset password'
                  : 'Provision login'}
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admin-set passwords are temporary; the employee must change them at next login.
            </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Login email, password provisioning, and reset require employee administration access.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
            }}
            options={deptOptions.length ? deptOptions : [LOADING_EMPLOYEE_FORM_OPTION]}
            fullWidth
          />
          <Select
            label="Designation"
            value={designationId}
            onChange={(e) => {
              setDesignationId(e.target.value);
            }}
            options={desigOptions.length ? desigOptions : [LOADING_EMPLOYEE_FORM_OPTION]}
            fullWidth
          />
        </div>
        <Select
          label={UI_FIELD_LABELS.reportingManager}
          value={reportingManagerId}
          onChange={(e) => {
            setReportingManagerId(e.target.value);
          }}
          options={
            managerOptions.length ? managerOptions : [LOADING_EMPLOYEE_FORM_OPTION]
          }
          fullWidth
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? UI_STATUS_TEXT.saving : UI_ACTION_TEXT.saveChanges}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            {UI_ACTION_TEXT.cancel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditEmployeeModal;
