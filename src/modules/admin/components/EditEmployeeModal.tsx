import { useCallback, useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  UpdateEmployeeDocument,
  ClientOpsOrgListsForEmployeeModalDocument,
  type UpdateEmployeeInput,
} from '../../../api/graphql/graphql';

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
  const [loginEmail, setLoginEmail] = useState('');
  const [deptOptions, setDeptOptions] = useState<{ value: string; label: string }[]>([]);
  const [desigOptions, setDesigOptions] = useState<{ value: string; label: string }[]>([]);
  const [managerOptions, setManagerOptions] = useState<{ value: string; label: string }[]>([]);
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
      setDeptOptions([
        { value: '', label: '— None —' },
        ...(res.departments ?? []).map((d) => ({
          value: d.id,
          label: `${d.name} (${d.code})`,
        })),
      ]);
      setDesigOptions([
        { value: '', label: '— None —' },
        ...(res.designations ?? []).map((d) => ({
          value: d.id,
          label: d.title,
        })),
      ]);
      const selfId = employee?.id;
      setManagerOptions([
        { value: '', label: '— None —' },
        ...(res.employees ?? [])
          .filter((em) => em.id !== selfId)
          .map((em) => ({
            value: em.id,
            label: `${em.fullName} (${em.employeeCode})`,
          })),
      ]);
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
    setLoginEmail(employee.linkedUserEmail ?? '');
    setFormError(null);
  }, [employee, isOpen]);

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'PROBATION', label: 'Probation' },
  ];

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
      const email = loginEmail.trim();
      if (email && email !== (employee.linkedUserEmail ?? '').trim()) {
        input.loginEmail = email;
      }
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit employee — ${employee.employeeCode}`}>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
        {orgLoadError && (
          <p className="text-sm text-amber-800 dark:text-amber-200">{orgLoadError}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Employee code and date of joining are not editable here (backend limitation).
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label="Employee code" value={employee.employeeCode} fullWidth disabled />
          <Input
            type="date"
            label="Date of joining"
            value={employee.dateOfJoining.slice(0, 10)}
            fullWidth
            disabled
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="First name *"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
            fullWidth
            required
          />
          <Input
            label="Last name *"
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
          options={statusOptions}
          fullWidth
        />
        <Input
          label="Employment type"
          value={employmentType}
          onChange={(e) => {
            setEmploymentType(e.target.value);
          }}
          fullWidth
          placeholder="e.g. PERMANENT"
        />
        <Input
          label="Login email"
          type="email"
          value={loginEmail}
          onChange={(e) => {
            setLoginEmail(e.target.value);
          }}
          fullWidth
          placeholder="employee@company.com"
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
            }}
            options={deptOptions.length ? deptOptions : [{ value: '', label: '— Loading —' }]}
            fullWidth
          />
          <Select
            label="Designation"
            value={designationId}
            onChange={(e) => {
              setDesignationId(e.target.value);
            }}
            options={desigOptions.length ? desigOptions : [{ value: '', label: '— Loading —' }]}
            fullWidth
          />
        </div>
        <Select
          label="Reporting manager"
          value={reportingManagerId}
          onChange={(e) => {
            setReportingManagerId(e.target.value);
          }}
          options={
            managerOptions.length ? managerOptions : [{ value: '', label: '— Loading —' }]
          }
          fullWidth
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditEmployeeModal;
