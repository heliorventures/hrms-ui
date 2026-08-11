import { useCallback, useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { toDateInputValue } from '../../../utils/dateInput';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { UI_ACTION_TEXT, UI_FIELD_LABELS, UI_STATUS_TEXT } from '../../../constants/uiText';
import {
  CreateEmployeeDocument,
  ClientOpsOrgListsForEmployeeModalDocument,
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

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateEmployeeModal = ({ isOpen, onClose, onCreated }: CreateEmployeeModalProps) => {
  const client = useGraphClient('client');
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
      setManagerOptions(buildManagerOptions(res.employees ?? []));
    } catch (e) {
      setOrgLoadError(graphQlUserMessage(e));
    }
  }, [client, isOpen]);

  useEffect(() => {
    void loadOrg();
  }, [loadOrg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
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
      await client.request(CreateEmployeeDocument, { input: input as CreateEmployeeInput });
      onCreated();
      onClose();
      setEmployeeCode('');
      setFirstName('');
      setLastName('');
      setDepartmentId('');
      setDesignationId('');
      setReportingManagerId('');
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Employee">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
        {orgLoadError && (
          <p className="text-sm text-amber-800 dark:text-amber-200">{orgLoadError}</p>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label={`${UI_FIELD_LABELS.employeeCode} *`}
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
            label={`${UI_FIELD_LABELS.dateOfJoining} *`}
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
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          Login account creation is intentionally not available here until the secure invite or
          password-reset workflow is wired. Create the employee record, then provision sign-in
          through the approved account workflow.
        </p>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? UI_STATUS_TEXT.creating : UI_ACTION_TEXT.create}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            {UI_ACTION_TEXT.cancel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEmployeeModal;
