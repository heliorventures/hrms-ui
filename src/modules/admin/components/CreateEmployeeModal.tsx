import { useCallback, useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      id
      employeeCode
      fullName
      status
      dateOfJoining
    }
  }
`;

const ORG_LISTS = gql`
  query OrgListsForNewEmployee($dlim: Int! = 100, $glim: Int! = 100) {
    departments(limit: $dlim) {
      id
      name
      code
    }
    designations(limit: $glim) {
      id
      title
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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [employeeCode, setEmployeeCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('ACTIVE');
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [deptOptions, setDeptOptions] = useState<{ value: string; label: string }[]>([]);
  const [desigOptions, setDesigOptions] = useState<{ value: string; label: string }[]>([]);
  const [orgLoadError, setOrgLoadError] = useState<string | null>(null);

  const loadOrg = useCallback(async () => {
    if (!isOpen) return;
    setOrgLoadError(null);
    try {
      const res = await client.request<{
        departments: { id: string; name: string; code: string }[];
        designations: { id: string; title: string }[];
      }>(ORG_LISTS, { dlim: 100, glim: 100 });
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
      await client.request(CREATE_EMPLOYEE, { input });
      onCreated();
      onClose();
      setEmployeeCode('');
      setFirstName('');
      setLastName('');
      setDepartmentId('');
      setDesignationId('');
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
