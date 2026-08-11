import { useCallback, useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { UI_ACTION_TEXT, UI_FIELD_LABELS, UI_STATUS_TEXT } from '../../../constants/uiText';
import {
  UpdateEmployeeDocument,
  ClientOpsOrgListsForEmployeeModalDocument,
  type UpdateEmployeeInput,
} from '../../../api/graphql/graphql';
import {
  buildDepartmentOptions,
  buildDesignationOptions,
  buildManagerOptions,
  EMPLOYEE_STATUS_OPTIONS,
  LOADING_EMPLOYEE_FORM_OPTION,
  type SelectOption,
} from '../employeeFormOptions';

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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [employmentType, setEmploymentType] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [deptOptions, setDeptOptions] = useState<SelectOption[]>([]);
  const [desigOptions, setDesigOptions] = useState<SelectOption[]>([]);
  const [managerOptions, setManagerOptions] = useState<SelectOption[]>([]);
  const [orgLoadError, setOrgLoadError] = useState<string | null>(null);

  const loadOrg = useCallback(async () => {
    if (!isOpen) return;
    setOrgLoadError(null);
    try {
      const res = await client.request<{
        departments: { id: string; name: string; code: string }[];
        designations: { id: string; title: string }[];
        employees: { id: string; employeeCode: string; fullName: string }[];
      }>(ClientOpsOrgListsForEmployeeModalDocument, { dlim: 100, glim: 100, elim: 100 });
      setDeptOptions(buildDepartmentOptions(res.departments ?? []));
      setDesigOptions(buildDesignationOptions(res.designations ?? []));
      setManagerOptions(buildManagerOptions(res.employees ?? [], employee?.id));
    } catch (e) {
      setOrgLoadError(graphQlUserMessage(e));
    }
  }, [client, isOpen, employee?.id]);

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
    setFormError(null);
  }, [employee, isOpen]);

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
      await client.request(UpdateEmployeeDocument, { input: input as UpdateEmployeeInput });
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
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Login creation and password reset are intentionally handled outside this employee edit
            form until the secure account workflow is wired.
          </p>
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
