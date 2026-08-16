import { type FormEvent } from 'react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import type {
  AssignmentForm,
  BoardResult,
  ComponentForm,
  SalaryBreakupPreview,
  StructureDraftLine,
} from './payrollCompensationTypes';

interface SalaryComponentsSectionProps {
  board: BoardResult | null;
  busy: boolean;
  loading: boolean;
  componentForm: ComponentForm;
  onComponentFormChange: (next: ComponentForm) => void;
  onSubmit: (event: FormEvent) => void;
}

export function SalaryComponentsSection({
  board,
  busy,
  loading,
  componentForm,
  onComponentFormChange,
  onSubmit,
}: SalaryComponentsSectionProps) {
  return (
    <Card title="Salary Components">
      <form className="grid gap-3 md:grid-cols-6" onSubmit={onSubmit}>
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
          placeholder="Component name, e.g. Basic"
          value={componentForm.name}
          onChange={(event) => onComponentFormChange({ ...componentForm, name: event.target.value })}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Code, e.g. BASIC"
          value={componentForm.code}
          onChange={(event) => onComponentFormChange({ ...componentForm, code: event.target.value })}
        />
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={componentForm.componentType}
          onChange={(event) => onComponentFormChange({ ...componentForm, componentType: event.target.value })}
        >
          <option value="EARNING">Earning</option>
          <option value="DEDUCTION">Deduction</option>
          <option value="EMPLOYER_CONTRIBUTION">Employer Contribution</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={componentForm.isTaxable}
            onChange={(event) => onComponentFormChange({ ...componentForm, isTaxable: event.target.checked })}
          />
          Taxable
        </label>
        <Button type="submit" disabled={busy}>
          Save
        </Button>
      </form>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {(board?.salaryComponents ?? []).map((component) => (
          <div key={component.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <span className="font-medium">{component.name}</span>{' '}
            <span className="text-slate-500">
              {component.code} - {component.componentType}
            </span>
          </div>
        ))}
        {!loading && (board?.salaryComponents ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No salary components configured.</p>
        ) : null}
      </div>
    </Card>
  );
}

interface SalaryStructureSectionProps {
  board: BoardResult | null;
  busy: boolean;
  structureName: string;
  structureDescription: string;
  structureLines: StructureDraftLine[];
  lineDraft: StructureDraftLine;
  onStructureNameChange: (value: string) => void;
  onStructureDescriptionChange: (value: string) => void;
  onLineDraftChange: (value: StructureDraftLine) => void;
  onAddLine: () => void;
  onSubmit: (event: FormEvent) => void;
}

export function SalaryStructureSection({
  board,
  busy,
  structureName,
  structureDescription,
  structureLines,
  lineDraft,
  onStructureNameChange,
  onStructureDescriptionChange,
  onLineDraftChange,
  onAddLine,
  onSubmit,
}: SalaryStructureSectionProps) {
  return (
    <Card title="Salary Structure Template">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Structure name, e.g. India Standard CTC"
            value={structureName}
            onChange={(event) => onStructureNameChange(event.target.value)}
          />
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Description"
            value={structureDescription}
            onChange={(event) => onStructureDescriptionChange(event.target.value)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2"
            value={lineDraft.salaryComponentId}
            onChange={(event) => onLineDraftChange({ ...lineDraft, salaryComponentId: event.target.value })}
          >
            <option value="">Select component</option>
            {(board?.salaryComponents ?? []).map((component) => (
              <option key={component.id} value={component.id}>
                {component.code} - {component.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={lineDraft.calculationBasis}
            onChange={(event) => onLineDraftChange({ ...lineDraft, calculationBasis: event.target.value })}
          >
            <option value="PERCENT_OF_CTC">% of CTC</option>
            <option value="PERCENT_OF_BASIC">% of Basic</option>
            <option value="FIXED_ANNUAL">Fixed annual</option>
            <option value="FIXED_MONTHLY">Fixed monthly</option>
          </select>
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Value"
            value={lineDraft.calculationValue}
            onChange={(event) => onLineDraftChange({ ...lineDraft, calculationValue: event.target.value })}
          />
          <Button type="button" variant="outline" onClick={onAddLine}>
            Add line
          </Button>
        </div>
        {structureLines.length > 0 ? (
          <ul className="space-y-2">
            {structureLines.map((line, index) => {
              const component = board?.salaryComponents.find((row) => row.id === line.salaryComponentId);
              return (
                <li key={`${line.salaryComponentId}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  {component?.code ?? line.salaryComponentId}: {line.calculationValue} {line.calculationBasis}
                </li>
              );
            })}
          </ul>
        ) : null}
        <Button type="submit" disabled={busy}>
          Save structure
        </Button>
      </form>

      <div className="mt-5 space-y-3">
        {(board?.salaryStructures ?? []).map((structure) => (
          <div key={structure.id} className="rounded-xl border border-slate-200 p-3">
            <p className="font-medium text-slate-900">{structure.name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {structure.components
                .map((line) => `${line.componentCode}: ${line.calculationValue} ${line.calculationBasis}`)
                .join(' - ')}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface AssignAnnualCtcSectionProps {
  board: BoardResult | null;
  busy: boolean;
  assignmentForm: AssignmentForm;
  selectedJoiningDate?: string;
  onAssignmentFormChange: (value: AssignmentForm) => void;
  onPreviewReset: () => void;
  onSubmit: (event: FormEvent) => void;
}

export function AssignAnnualCtcSection({
  board,
  busy,
  assignmentForm,
  selectedJoiningDate,
  onAssignmentFormChange,
  onPreviewReset,
  onSubmit,
}: AssignAnnualCtcSectionProps) {
  return (
    <Card title="Assign Annual CTC">
      <form className="grid gap-3 md:grid-cols-5" onSubmit={onSubmit}>
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2"
          value={assignmentForm.employeeId}
          onChange={(event) => {
            const employee = board?.employees.find((row) => row.id === event.target.value);
            onAssignmentFormChange({
              ...assignmentForm,
              employeeId: event.target.value,
              effectiveFrom: employee?.dateOfJoining?.slice(0, 10) ?? assignmentForm.effectiveFrom,
            });
            onPreviewReset();
          }}
        >
          <option value="">Select employee</option>
          {(board?.employees ?? []).map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.employeeCode} - {employee.fullName}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={assignmentForm.salaryStructureId}
          onChange={(event) => onAssignmentFormChange({ ...assignmentForm, salaryStructureId: event.target.value })}
        >
          <option value="">Structure</option>
          {(board?.salaryStructures ?? []).map((structure) => (
            <option key={structure.id} value={structure.id}>
              {structure.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Annual CTC, e.g. 3000000"
          value={assignmentForm.annualCtc}
          onChange={(event) => onAssignmentFormChange({ ...assignmentForm, annualCtc: event.target.value })}
        />
        <Button type="submit" disabled={busy}>
          Assign
        </Button>
        <input
          type="date"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={assignmentForm.effectiveFrom}
          onChange={(event) => onAssignmentFormChange({ ...assignmentForm, effectiveFrom: event.target.value })}
        />
        {selectedJoiningDate ? (
          <p className="text-xs text-slate-500 md:col-span-4">Joining date: {selectedJoiningDate}</p>
        ) : null}
      </form>
    </Card>
  );
}

export function SalaryBreakupPreviewSection({ preview }: { preview: SalaryBreakupPreview }) {
  return (
    <Card title="Salary Breakup Preview">
      <div className="grid gap-3 text-sm md:grid-cols-4">
        <div>Annual CTC: {preview.annualCtc}</div>
        <div>Monthly gross: {preview.monthlyGross}</div>
        <div>Monthly deductions: {preview.monthlyDeductions}</div>
        <div>Net before statutory: {preview.monthlyNetBeforeStatutory}</div>
      </div>
      <ul className="mt-4 divide-y divide-slate-200">
        {preview.lines.map((line) => (
          <li key={line.salaryComponentId} className="grid gap-2 py-2 text-sm md:grid-cols-5">
            <span className="font-medium">{line.componentName}</span>
            <span>{line.componentType}</span>
            <span>
              {line.calculationValue} {line.calculationBasis}
            </span>
            <span>Annual {line.annualAmount}</span>
            <span>Monthly {line.monthlyAmount}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
