import type { GraphQLClient } from 'graphql-request';

import Button from '../../../components/common/Button';
import type { usePeriodInputEditor } from '../hooks/usePeriodInputEditor';

import ApprovedLwpReview from './ApprovedLwpReview';
import AutomaticPeriodFields from './AutomaticPeriodFields';
import PeriodInputFields from './PeriodInputFields';

const MonthlyInputForm = ({
  state,
  client,
  employeeId,
}: {
  state: ReturnType<typeof usePeriodInputEditor>;
  client: GraphQLClient;
  employeeId: string;
}) => {
  const { draft } = state;
  if (!draft) return null;
  return (
    <fieldset disabled={state.locked} className="space-y-3">
      {state.locked && (
        <p role="status">
          This payroll cycle is finalized and locked. Monthly inputs cannot be edited.
        </p>
      )}
      <p className="text-sm">Status: {state.record?.ready ? 'Ready' : 'Draft: review required'}</p>
      <label className="block">
        Calculation mode
        <select
          className="block rounded border p-2"
          disabled={state.busy}
          value={draft.automatic ? 'AUTOMATIC' : 'SOURCE'}
          onChange={(event) =>
            state.setDraft({
              ...draft,
              automatic:
                event.target.value === 'AUTOMATIC'
                  ? {
                      use_employee_configuration: true,
                      lwp_override: null,
                      eligibility: {
                        pf_applicable: null,
                        esi_applicable: null,
                        esi_continuation_until: null,
                        disability: null,
                        average_daily_wage: null,
                      },
                      withholding_override: null,
                    }
                  : null,
            })
          }
        >
          <option value="SOURCE">Reviewed source amounts</option>
          <option value="AUTOMATIC">Effective salary and company rules</option>
        </select>
      </label>
      {draft.automatic ? (
        <AutomaticPeriodFields draft={draft} disabled={state.busy} onChange={state.setDraft} />
      ) : (
        <PeriodInputFields draft={draft} disabled={state.busy} onChange={state.setDraft} />
      )}
      {!draft.automatic?.use_employee_configuration && (
        <ApprovedLwpReview
          client={client}
          employeeId={employeeId}
          draft={draft}
          disabled={state.busy}
          onChange={state.setDraft}
        />
      )}
      {!draft.automatic && (
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
      )}
      {!state.locked && (
        <Button disabled={state.busy} onClick={() => void state.save()}>
          Validate and save
        </Button>
      )}
    </fieldset>
  );
};
export default MonthlyInputForm;
