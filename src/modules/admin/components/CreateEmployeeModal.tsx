import { useCallback, useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useAuth } from '../../../contexts/AuthContext';
import { toDateInputValue } from '../../../utils/dateInput';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { UI_ACTION_TEXT, UI_FIELD_LABELS, UI_STATUS_TEXT } from '../../../constants/uiText';
import {
  CreateEmployeeDocument,
  type CreateEmployeeInput,
} from '../../../api/graphql/graphql';
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

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateEmployeeModal = ({ isOpen, onClose, onCreated }: CreateEmployeeModalProps) => {
  const client = useGraphClient('client');
  const { can } = useAuth();
  const canManageLoginAccounts = can('role:manage');
  const [createLogin, setCreateLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [employeeCode, setEmployeeCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState(() => toDateInputValue());
  const [status, setStatus] = useState('ACTIVE');
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [deptOptions, setDeptOptions] = useState<SelectOption[]>([]);
  const [desigOptions, setDesigOptions] = useState<SelectOption[]>([]);
  const [managerOptions, setManagerOptions] = useState<SelectOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
  const [orgLoadError, setOrgLoadError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setCreateLogin(canManageLoginAccounts);
    setUsername('');
    setEmail('');
    setInitialPassword('');
    setConfirmPassword('');
    setRoleId('');
    setFormError(null);
    setEmployeeCode('');
    setFirstName('');
    setLastName('');
    setDateOfJoining(toDateInputValue());
    setStatus('ACTIVE');
    setDepartmentId('');
    setDesignationId('');
    setReportingManagerId('');
    setOrgLoadError(null);
  }, [canManageLoginAccounts]);

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
        canManageLoginAccounts ? EmployeeModalAdminDirectoryDocument : EmployeeModalDirectoryDocument,
        { dlim: 100, glim: 100, elim: 100, rlim: 80 }
      );
      setDeptOptions(buildDepartmentOptions(res.departments ?? []));
      setDesigOptions(buildDesignationOptions(res.designations ?? []));
      setManagerOptions(buildManagerOptions(res.employees ?? []));
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
  }, [canManageLoginAccounts, client, isOpen]);

  useEffect(() => {
    void loadOrg();
  }, [loadOrg]);

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
  }, [isOpen, resetForm]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    resetForm();
    onClose();
  }, [onClose, resetForm, submitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (createLogin && !canManageLoginAccounts) {
      setFormError('Login account creation requires RBAC admin access.');
      return;
    }
    if (createLogin) {
      if (!username.trim()) {
        setFormError('Username is required when creating a login account.');
        return;
      }
      if (initialPassword.length < 8) {
        setFormError('Initial password must be at least 8 characters.');
        return;
      }
      if (initialPassword !== confirmPassword) {
        setFormError('Initial password and confirmation do not match.');
        return;
      }
    }
    setSubmitting(true);
    try {
      const input: Record<string, unknown> = {
        employeeCode: employeeCode.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfJoining,
        status,
      };
      if (departmentId) {
        input.departmentId = departmentId;
      }
      if (designationId) {
        input.designationId = designationId;
      }
      if (reportingManagerId) {
        input.reportingManagerId = reportingManagerId;
      }
      if (createLogin) {
        input.loginAccount = {
          username: username.trim(),
          email: email.trim() || undefined,
          initialPassword,
          roleIds: roleId ? [roleId] : [],
        };
      }
      await client.request(CreateEmployeeDocument, { input: input as CreateEmployeeInput });
      onCreated();
      resetForm();
      onClose();
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Employee">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
        {orgLoadError && (
          <p className="text-sm text-amber-800 dark:text-amber-200">{orgLoadError}</p>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label={UI_FIELD_LABELS.employeeCode}
            value={employeeCode}
            onChange={(e) => {
              setEmployeeCode(e.target.value);
            }}
            fullWidth
            required
            placeholder="EMP0042"
          />
          <Input
            type="date"
            label={UI_FIELD_LABELS.dateOfJoining}
            value={dateOfJoining}
            onChange={(e) => {
              setDateOfJoining(e.target.value);
            }}
            fullWidth
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label={UI_FIELD_LABELS.firstName}
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
            fullWidth
            required
          />
          <Input
            label={UI_FIELD_LABELS.lastName}
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
        {canManageLoginAccounts ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/40">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
            <input
              type="checkbox"
              checked={createLogin}
              onChange={(event) => setCreateLogin(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            Create login account
          </label>
          {createLogin && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  required={createLogin}
                  autoComplete="off"
                  placeholder="mobile number or unique name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  autoComplete="off"
                  placeholder="optional"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Initial Password"
                  type="password"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  fullWidth
                  required={createLogin}
                  minLength={8}
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required={createLogin}
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <Select
                label="Initial Role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                options={roleOptions.length ? roleOptions : [{ value: '', label: 'No role assigned' }]}
                fullWidth
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The employee must change this temporary password at next login.
              </p>
            </div>
          )}
        </div>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            Login account creation requires RBAC admin access.
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? UI_STATUS_TEXT.creating : UI_ACTION_TEXT.create}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            {UI_ACTION_TEXT.cancel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEmployeeModal;
