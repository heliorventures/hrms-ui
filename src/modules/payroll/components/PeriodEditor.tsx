import type { GraphQLClient } from 'graphql-request';

import Button from '../../../components/common/Button';
import FeedbackToast from '../../../components/common/FeedbackToast';
import { usePeriodInputEditor } from '../hooks/usePeriodInputEditor';

import MonthlyInputForm from './MonthlyInputForm';

interface Props {
  client: GraphQLClient;
  employeeId: string;
  year: number;
  month: number;
}
const PeriodEditor = ({ client, employeeId, year, month }: Props) => {
  const state = usePeriodInputEditor(client, employeeId, year, month);
  const { draft } = state;
  return (
    <div className="mt-4 space-y-3">
      {state.busy && <p role="status">Loading or saving monthly input...</p>}
      {state.error && (
        <FeedbackToast variant={'error'} messageKey={state.error}>
          {state.error}
        </FeedbackToast>
      )}
      {state.notice && (
        <FeedbackToast variant={'info'} messageKey={state.notice}>
          {state.notice}
        </FeedbackToast>
      )}
      {draft && <MonthlyInputForm state={state} client={client} employeeId={employeeId} />}
      {!draft && !state.busy && !state.error && !state.locked && (
        <div className="space-y-2 text-sm">
          <p>
            No monthly input exists for this employee and period. Create a draft and review every
            amount before payroll generation.
          </p>
          <Button type="button" onClick={state.create}>
            Create monthly draft
          </Button>
        </div>
      )}
    </div>
  );
};
export default PeriodEditor;
