import Button from '../../components/common/Button';

import { exitDecisionFields } from './exitDecisionForm';
import ExitExposureSummary from './ExitExposureSummary';
import type { FinanceOwner } from './exitFinanceModel';
import ExitPayrollSummary from './ExitPayrollSummary';
import FnfPayrollReferences from './FnfPayrollReferences';
import { fnfSourceFields } from './fnfSourceForm';
import LoanFields from './LoanFields';
import { yesNo, type LoanField } from './loanForm';
import type { useFnfFinanceReview } from './useFnfFinanceReview';
import type { useLoanOptions } from './useLoanOptions';

interface Props {
  state: ReturnType<typeof useFnfFinanceReview>;
  owners: ReturnType<typeof useLoanOptions<FinanceOwner>>;
  date: string;
  onEdit: () => void;
}
const FnfSourceEditor = ({ state, owners, date, onEdit }: Props) => {
  if (!state.context) return null;
  const fields = reviewFields(state, owners.data?.nodes ?? []);
  return (
    <>
      <ExitExposureSummary exposure={state.context.exposure} />
      <ExitPayrollSummary context={state.context.payrollContext} />
      <FnfPayrollReferences state={state} onEdit={onEdit} />
      <p className="text-sm">
        Currency: {state.context.currency}. Enter explicit zeroes for resolved components with no
        payable amount. Amounts already paid and other recoveries reduce each source&apos;s
        remaining cash.
      </p>
      <fieldset disabled={state.busy}>
        <LoanFields
          fields={fields}
          values={state.values}
          onChange={(key, value) => {
            state.setValues((current) => ({ ...current, [key]: value }));
            state.edit();
            onEdit();
          }}
        />
      </fieldset>

      <Button
        disabled={state.busy || date !== state.context.exposure.settlementDate}
        onClick={() => {
          onEdit();
          void state.save(fields);
        }}
      >
        Calculate and save financial review
      </Button>
    </>
  );
};
export default FnfSourceEditor;
function reviewFields(
  state: ReturnType<typeof useFnfFinanceReview>,
  owners: FinanceOwner[]
): LoanField[] {
  if (!state.context) return [];
  return [
    { key: 'minorUnits', label: 'Currency decimal places (0–4)', type: 'integer' },
    ...fnfSourceFields(state.sources),
    ...exitDecisionFields(state.context.exposure, owners, false),
    { key: 'approval', label: 'Financial approval reference' },
    { key: 'reason', label: 'Loan recovery and residual decision', type: 'textarea' },
    ...(state.prepared?.legacyFiguresFingerprint
      ? [
          {
            key: 'legacyOther',
            label: 'Reviewed legacy recovery is classified as OTHER, separately from loan recovery',
            options: yesNo,
          },
          {
            key: 'legacyReason',
            label: 'Legacy figure reconciliation reason',
            type: 'textarea' as const,
          },
        ]
      : []),
  ];
}
