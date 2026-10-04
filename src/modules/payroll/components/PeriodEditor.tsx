import type { GraphQLClient } from 'graphql-request';

import Button from '../../../components/common/Button';
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
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.notice && (
        <p role="status" className="text-sm text-slate-700">
          {state.notice}
        </p>
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
