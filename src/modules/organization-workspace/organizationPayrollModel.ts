import { OrganizationDataError } from './organizationDataError';
import {
  asRecord,
  optionalString,
  requiredString,
  type OrganizationRecord,
} from './organizationDocuments';

export interface ReviewedPayrollEmployee {
  id: string;
  label: string;
  outcome: string;
  reason: string | null;
  prepared: OrganizationRecord | null;
  requiresTaxAcknowledgement: boolean;
}
export interface ReviewedPayrollDraft {
  cycle: OrganizationRecord;
  revision: number;
  fingerprint: string;
  canFinalize: boolean;
  blockReason: string | null;
  employees: ReviewedPayrollEmployee[];
}

function reviewedEmployee(value: unknown): ReviewedPayrollEmployee {
  const employee = asRecord(value);
  const prepared = employee.prepared === null ? null : asRecord(employee.prepared);
  if (prepared && typeof prepared.requires_tax_acknowledgement !== 'boolean')
    throw new OrganizationDataError(
      'The source tax acknowledgement requirement is unavailable. Refresh the reviewed draft.'
    );
  return {
    id: requiredString(employee, 'employee_id'),
    label: requiredString(employee, 'employee_label'),
    outcome: requiredString(employee, 'outcome'),
    reason: optionalString(employee, 'reason'),
    prepared,
    requiresTaxAcknowledgement: prepared?.requires_tax_acknowledgement === true,
  };
}
export function readPayrollDraft(value: unknown, cycleId: string): ReviewedPayrollDraft {
  const source = asRecord(value);
  const cycle = asRecord(source.cycle);
  const draft = asRecord(source.draft);
  if (cycle.id !== cycleId || draft.cycle_id !== cycleId)
    throw new OrganizationDataError('The source draft does not match the selected payroll cycle.');
  const { revision } = draft;
  if (typeof revision !== 'number' || !Number.isSafeInteger(revision) || revision <= 0)
    throw new OrganizationDataError('The source reviewed draft revision is unavailable.');
  const fingerprint = optionalString(draft, 'fingerprint');
  if (!fingerprint)
    throw new OrganizationDataError('The source review fingerprint is unavailable.');
  if (!Array.isArray(draft.employees) || typeof draft.can_finalize !== 'boolean')
    throw new OrganizationDataError('The reviewed draft is incomplete.');
  return {
    cycle,
    revision,
    fingerprint,
    canFinalize: draft.can_finalize,
    blockReason: optionalString(draft, 'finalization_block_reason'),
    employees: draft.employees.map(reviewedEmployee),
  };
}
export function payrollDraftPayload(cycle: OrganizationRecord): Record<string, unknown> {
  const revision = cycle.draft_revision;
  if (revision === null) return { expected_revision: null };
  if (typeof revision !== 'number' || !Number.isSafeInteger(revision) || revision < 0)
    throw new OrganizationDataError(
      'The source draft revision is unavailable. Refresh payroll cycles.'
    );
  return { expected_revision: revision };
}
export function payrollFinalizePayload(
  draft: ReviewedPayrollDraft,
  acknowledged: ReadonlySet<string>
): Record<string, unknown> {
  if (!draft.canFinalize)
    throw new OrganizationDataError('The reviewed draft is not ready for finalization.');
  const required = draft.employees
    .filter((employee) => employee.requiresTaxAcknowledgement)
    .map((employee) => employee.id);
  if (required.some((id) => !acknowledged.has(id)))
    throw new OrganizationDataError('Complete each provisional tax acknowledgement.');
  return {
    revision: draft.revision,
    fingerprint: draft.fingerprint,
    acknowledgement: { provisional_tax_employees: required },
  };
}
