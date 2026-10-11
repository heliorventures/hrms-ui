import { array, flag, object, text } from './financeJson';
import { yesNo, type LoanField, type LoanValues } from './loanForm';

export interface FnfSource {
  id: string;
  kind: string;
}
const kinds = ['LEAVE_ENCASHMENT', 'GRATUITY', 'BONUS'];
const label = (kind: string) => kind.replace(/_/g, ' ').toLowerCase();
export function initialFnfSources(input: unknown): { sources: FnfSource[]; values: LoanValues } {
  if (!input)
    return { sources: kinds.map((kind) => ({ kind, id: crypto.randomUUID() })), values: {} };
  const record = object(input);
  const values: LoanValues = { approval: text(record.financialApprovalReference) };
  const sources = array(record.sources).map((item) => {
    const row = object(item),
      id = text(row.sourceId),
      kind = text(row.kind);
    for (const field of ['amount', 'alreadyPaid', 'otherRecovery', 'approvalReference'])
      values[`${id}:${field}`] = text(row[field]);
    values[`${id}:eligible`] = flag(row.eligibleForLoan) ? 'yes' : 'no';
    return { id, kind };
  });
  return { sources, values };
}
export function fnfSourceFields(sources: FnfSource[]): LoanField[] {
  return sources.flatMap((source) => {
    const field = (key: string, name: string, type?: LoanField['type']): LoanField => ({
      key: `${source.id}:${key}`,
      label: `${label(source.kind)} · ${name}`,
      type,
    });
    if (source.kind === 'PAYROLL_REFERENCE')
      return [
        {
          ...field('amount', 'Issued salary reference (excluded from FNF cash)', 'decimal'),
          readOnly: true,
        },
        field('approvalReference', 'Reference review evidence'),
      ];
    return [
      field('amount', 'Approved amount', 'decimal'),
      field('alreadyPaid', 'Already paid outside this settlement', 'decimal'),
      field('otherRecovery', 'Other recovery allocated to this source', 'decimal'),
      { ...field('eligible', 'Permitted for loan set-off'), options: yesNo },
      field('approvalReference', 'Valuation and set-off approval reference'),
    ];
  });
}
export function fnfSources(sources: FnfSource[], values: LoanValues) {
  return sources.map((source) => ({
    kind: source.kind,
    sourceId: source.id,
    amount: values[`${source.id}:amount`],
    alreadyPaid: values[`${source.id}:alreadyPaid`],
    otherRecovery: values[`${source.id}:otherRecovery`],
    eligibleForLoan: values[`${source.id}:eligible`] === 'yes',
    approvalReference: values[`${source.id}:approvalReference`],
  }));
}
