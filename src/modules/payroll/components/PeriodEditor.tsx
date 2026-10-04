import type { GraphQLClient } from 'graphql-request';

import Button from '../../../components/common/Button';
import { usePeriodInputEditor } from '../hooks/usePeriodInputEditor';

import ApprovedLwpReview from './ApprovedLwpReview';
import PeriodInputFields from './PeriodInputFields';

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
      {draft && (
        <>
          <p className="text-sm">
            Status: {state.record?.ready ? 'Ready' : 'Draft: review required'}
          </p>
          <PeriodInputFields draft={draft} disabled={state.busy} onChange={state.setDraft} />
          <ApprovedLwpReview
            client={client}
            employeeId={employeeId}
            draft={draft}
            disabled={state.busy}
            onChange={state.setDraft}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.revised}
              disabled={state.busy}
              onChange={(event) => state.setRevised(event.target.checked)}
            />
            I reviewed changed amounts; reconcile using these inputs instead of the original source
            totals.
          </label>
          <Button disabled={state.busy} onClick={() => void state.save()}>
            Validate and save
          </Button>
        </>
      )}
      {!draft && !state.busy && !state.error && (
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
