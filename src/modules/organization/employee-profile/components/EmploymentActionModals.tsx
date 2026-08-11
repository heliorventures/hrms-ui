import type { ChangeEvent } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import Modal from '../../../../components/common/Modal';
import Select from '../../../../components/common/Select';
import { ConfirmationModal } from './ConfirmationModal';

interface DepartmentOption {
  id: string;
  name: string;
}

interface DesignationOption {
  id: string;
  title: string;
}

interface ManagerOption {
  value: string;
  label: string;
}

interface EmploymentActionModalsProps {
  assignOpen: boolean;
  departmentId: string;
  departments: DepartmentOption[];
  designationId: string;
  designations: DesignationOption[];
  managerChoice: string;
  managerOptions: ManagerOption[];
  newSalaryAnnual: string;
  pctHike: number;
  roleEffective: string;
  roleOpen: boolean;
  roleSaving: boolean;
  salaryEffective: string;
  salaryOpen: boolean;
  salaryReason: string;
  salarySaving: boolean;
  statusSaving: boolean;
  termEffective: string;
  termReason: string;
  terminateOpen: boolean;
  onAssignClose: () => void;
  onDepartmentChange: (value: string) => void;
  onDesignationChange: (value: string) => void;
  onManagerChoiceChange: (value: string) => void;
  onNewSalaryAnnualChange: (value: string) => void;
  onRoleClose: () => void;
  onRoleEffectiveChange: (value: string) => void;
  onSalaryClose: () => void;
  onSalaryEffectiveChange: (value: string) => void;
  onSalaryReasonChange: (value: string) => void;
  onSaveRole: () => void;
  onSaveSalary: () => void;
  onTermEffectiveChange: (value: string) => void;
  onTermReasonChange: (value: string) => void;
  onTerminateClose: () => void;
  onTerminateConfirm: () => void;
}

export const EmploymentActionModals = ({
  assignOpen,
  departmentId,
  departments,
  designationId,
  designations,
  managerChoice,
  managerOptions,
  newSalaryAnnual,
  pctHike,
  roleEffective,
  roleOpen,
  roleSaving,
  salaryEffective,
  salaryOpen,
  salaryReason,
  salarySaving,
  statusSaving,
  termEffective,
  termReason,
  terminateOpen,
  onAssignClose,
  onDepartmentChange,
  onDesignationChange,
  onManagerChoiceChange,
  onNewSalaryAnnualChange,
  onRoleClose,
  onRoleEffectiveChange,
  onSalaryClose,
  onSalaryEffectiveChange,
  onSalaryReasonChange,
  onSaveRole,
  onSaveSalary,
  onTermEffectiveChange,
  onTermReasonChange,
  onTerminateClose,
  onTerminateConfirm,
}: EmploymentActionModalsProps) => (
  <>
    <ConfirmationModal
      isOpen={terminateOpen}
      onClose={onTerminateClose}
      title="Terminate Employment"
      warning="This action impacts payroll and access. Ensure offboarding tasks are coordinated."
      confirmLabel="Confirm termination"
      onConfirm={onTerminateConfirm}
    >
      <div className="space-y-3">
        <div className="flex gap-2 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm">
            Record-only fields below; wire effective date to payroll when the API supports it.
          </p>
        </div>
        <Input
          label="Effective Date"
          type="date"
          value={termEffective}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onTermEffectiveChange(event.target.value)}
          fullWidth
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            rows={3}
            value={termReason}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onTermReasonChange(event.target.value)}
          />
        </div>
      </div>
    </ConfirmationModal>

    <Modal isOpen={salaryOpen} onClose={onSalaryClose} title="Update Salary" size="md">
      <div className="space-y-3">
        <Input
          label="New Annual Base"
          value={newSalaryAnnual}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onNewSalaryAnnualChange(event.target.value)}
          fullWidth
        />
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Implied change: {pctHike >= 0 ? '+' : ''}
          {pctHike.toFixed(2)}%
        </p>
        <Input
          label="Effective Date"
          type="date"
          value={salaryEffective}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onSalaryEffectiveChange(event.target.value)}
          fullWidth
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            rows={2}
            value={salaryReason}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onSalaryReasonChange(event.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSalaryClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" disabled={salarySaving} onClick={onSaveSalary}>
            {salarySaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={roleOpen} onClose={onRoleClose} title="Update Role & Org" size="md">
      <div className="space-y-3">
        <Select
          label="Department"
          value={departmentId}
          fullWidth
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onDepartmentChange(event.target.value)}
          options={[
            { value: '', label: 'Keep Unchanged' },
            ...departments.map((department) => ({ value: department.id, label: department.name })),
          ]}
        />
        <Select
          label="Designation"
          value={designationId}
          fullWidth
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onDesignationChange(event.target.value)}
          options={[
            { value: '', label: 'Keep Unchanged' },
            ...designations.map((designation) => ({
              value: designation.id,
              label: designation.title,
            })),
          ]}
        />
        <Select
          label="Reporting Manager"
          value={managerChoice}
          fullWidth
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onManagerChoiceChange(event.target.value)}
          options={[
            { value: '__NOCHANGE__', label: 'No Change' },
            { value: '__CLEAR__', label: 'No Manager' },
            ...managerOptions,
          ]}
        />
        <Input
          label="Effective Date (Record Only)"
          type="date"
          value={roleEffective}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onRoleEffectiveChange(event.target.value)}
          fullWidth
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onRoleClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" disabled={roleSaving} onClick={onSaveRole}>
            {roleSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={assignOpen} onClose={onAssignClose} title="Company Assignments" size="md">
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Assignment entities are not exposed on this mutation yet. Use workforce admin screens when available.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onAssignClose} disabled={statusSaving}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  </>
);
