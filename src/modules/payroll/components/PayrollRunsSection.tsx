import type { usePayrollBoard } from '../hooks/usePayrollBoard';
import type { usePayrollBoardActions } from '../hooks/usePayrollBoardActions';

import PayrollCyclesCard from './PayrollCyclesCard';
import PayrollDraftReview from './PayrollDraftReview';

const PayrollRunsSection = ({
  board,
  actions,
}: {
  board: ReturnType<typeof usePayrollBoard>;
  actions: ReturnType<typeof usePayrollBoardActions>;
}) => (
  <>
    <div data-tour-anchor="payroll.cycles">
      <PayrollCyclesCard
        rows={board.data?.payrollCycles ?? []}
        form={actions.cycleForm}
        loading={board.loading}
        createBusy={actions.createBusy}
        createError={actions.createError}
        createOk={actions.createOk}
        runBusy={actions.runBusy}
        runError={actions.runError}
        runOk={actions.runOk}
        onChange={actions.setCycleField}
        onCreate={() => void actions.createCycle()}
        onRun={(payrollCycleId) => void actions.runPayroll(payrollCycleId)}
      />
    </div>
    {actions.draft && (
      <PayrollDraftReview
        key={`${actions.draft.cycle_id}:${actions.draft.revision}`}
        draft={actions.draft}
        busy={Boolean(actions.runBusy)}
        onFinalize={(employees) => void actions.finalize(employees)}
        onPaymentDate={(date) => void actions.savePaymentDate(date)}
        onRecalculate={() => {
          if (actions.draft) void actions.runPayroll(actions.draft.cycle_id);
        }}
      />
    )}
  </>
);
export default PayrollRunsSection;
