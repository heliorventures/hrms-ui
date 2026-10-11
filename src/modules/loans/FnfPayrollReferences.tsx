import { useState } from 'react';

import Button from '../../components/common/Button';
import Select from '../../components/common/Select';

import { payrollPeriod } from './exitPayrollContext';
import type { useFnfFinanceReview } from './useFnfFinanceReview';

const FnfPayrollReferences = ({
  state,
  onEdit,
}: {
  state: ReturnType<typeof useFnfFinanceReview>;
  onEdit: () => void;
}) => {
  const [selected, setSelected] = useState('');
  const slips = state.context?.payrollContext.recentIssuedPayslips ?? [];
  const available = slips.filter(
    (slip) =>
      !state.sources.some((source) => source.kind === 'PAYROLL_REFERENCE' && source.id === slip.id)
  );
  const add = () => {
    const slip = available.find((slip) => slip.id === selected);
    if (!slip) return;
    state.setSources((sources) => [...sources, { id: slip.id, kind: 'PAYROLL_REFERENCE' }]);
    state.setValues((values) => ({
      ...values,
      [`${slip.id}:amount`]: slip.amount,
      [`${slip.id}:alreadyPaid`]: '0',
      [`${slip.id}:otherRecovery`]: '0',
      [`${slip.id}:eligible`]: 'no',
      [`${slip.id}:approvalReference`]: '',
    }));
    setSelected('');
    state.edit();
    onEdit();
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <Select
          label="Issued salary reference"
          value={selected}
          disabled={state.busy}
          onChange={(event) => setSelected(event.target.value)}
          options={[
            { value: '', label: 'Choose an issued payslip' },
            ...available.map((slip) => ({
              value: slip.id,
              label: `${payrollPeriod(slip)} · ${slip.amount} · ${slip.id.slice(0, 8)}`,
            })),
          ]}
        />
        <Button
          variant="secondary"
          disabled={state.busy || !available.some((slip) => slip.id === selected)}
          onClick={add}
        >
          Add salary reference
        </Button>
      </div>
      {state.sources
        .filter((source) => source.kind === 'PAYROLL_REFERENCE')
        .map((source) => (
          <Button
            key={source.id}
            variant="quiet"
            disabled={state.busy}
            onClick={() => {
              state.setSources((sources) => sources.filter((item) => item !== source));
              state.edit();
              onEdit();
            }}
          >
            Remove salary reference {source.id.slice(0, 8)}
          </Button>
        ))}
    </div>
  );
};
export default FnfPayrollReferences;
