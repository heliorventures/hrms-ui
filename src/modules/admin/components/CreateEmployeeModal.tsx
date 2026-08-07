import { useCallback, useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { toDateInputValue } from '../../../utils/dateInput';
import {
  CreateEmployeeDocument,
  ClientOpsOrgListsForEmployeeModalDocument,
  type CreateEmployeeInput,
} from '../../../api/graphql/graphql';

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
  /** Login email for new tenant user (optional). TODO(invite-flow): replace provisional password UX with invite / reset. */
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
      setManagerOptions([
        { value: '', label: '— None —' },
        ...(res.employees ?? []).map((em) => ({
          value: em.id,
          label: `${em.fullName} (${em.employeeCode})`,
        })),
      ]);
    } catch (e) {
      setOrgLoadError(e instanceof Error ? e.message : 'Failed to load org lists');
    }
  }, [client, isOpen]);

  useEffect(() => {
    void loadOrg();
  }, [loadOrg]);

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'PROBATION', label: 'Probation' },
  ];

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
      const le = loginEmail.trim();
      if (le) {
        input.loginEmail = le;
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
      setLoginEmail('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add employee">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
        {orgLoadError && (
          <p className="text-sm text-amber-800 dark:text-amber-200">{orgLoadError}</p>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Employee code *"
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
            label="Date of joining *"
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
        <Input
          type="email"
          label="Login email (optional)"
          value={loginEmail}
          onChange={(e) => {
            setLoginEmail(e.target.value);
          }}
          fullWidth
          placeholder="new.hire@company.com"
          aria-description="If set, creates an account with provisional password ChangeMe!123 until invite flow ships."
        />
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {/* TODO(invite-flow): remove provisional-password hint when enrolment uses invite links or admin reset */}
          When provided, the employee can sign in with this email and provisional password{' '}
          <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">ChangeMe!123</code>{' '}
          (they should change it after first login once change-password or reset exists).
        </p>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEmployeeModal;
