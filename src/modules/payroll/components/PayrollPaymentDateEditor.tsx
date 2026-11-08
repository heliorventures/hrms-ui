import { useState } from 'react';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

export const PayrollPaymentDateEditor = ({
  busy,
  onSave,
}: {
  busy: boolean;
  onSave: (date: string) => void;
}) => {
  const [date, setDate] = useState('');
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="Payroll payment date"
          type="date"
          value={date}
          disabled={busy}
          onChange={(event) => setDate(event.target.value)}
        />
        <Button variant="outline" disabled={busy || !date} onClick={() => onSave(date)}>
          Save payment date
        </Button>
      </div>
      <p className="mt-2 text-xs text-content-secondary">
        Saving the date requires recalculating and reviewing this draft. Issued payslips cannot be
        changed.
      </p>
    </div>
  );
};
