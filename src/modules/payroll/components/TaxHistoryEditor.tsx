import { useState, type FormEvent } from 'react';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { taxFormErrorMessage } from '../taxFormError';
import { taxHistoryInput } from '../taxFormInputs';
import type { TaxHistory } from '../taxProjectionTypes';

const TaxHistoryEditor = ({
  busy,
  onSave,
  initial,
}: {
  busy: boolean;
  onSave: (value: TaxHistory) => void;
  initial?: TaxHistory;
}) => {
  const [year, setYear] = useState(initial?.fiscal_year ?? new Date().getFullYear());
  const [from, setFrom] = useState(initial?.period_start ?? '');
  const [until, setUntil] = useState(initial?.period_end ?? '');
  const [source, setSource] = useState(initial?.source_key ?? '');
  const [employer, setEmployer] = useState(initial?.employer ?? 'CURRENT');
  const [components, setComponents] = useState(
    Object.entries(initial?.components ?? {})
      .map(([code, value]) => `${code}=${value}`)
      .join('\n')
  );
  const [tds, setTds] = useState(initial?.tds ?? '');
  const [complete, setComplete] = useState(initial?.coverage === 'COMPLETE');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      onSave(
        taxHistoryInput({ year, from, until, source, employer, components, tds, complete, reason })
      );
    } catch (cause) {
      setError(taxFormErrorMessage(cause));
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3" data-tour-anchor="payroll.tax.history">
      <h3 className="font-semibold">Recorded earnings and deduction history</h3>
      <p className="text-sm">
        Blank means not provided. Enter zero only when HR confirms no deduction. Covered periods
        must not overlap imported or finalized payroll.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          required
          label="Tax year starts in"
          type="number"
          min={2000}
          max={2199}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
        <Input
          required
          label="Source reference"
          value={source}
          disabled={Boolean(initial)}
          onChange={(e) => setSource(e.target.value)}
        />
        <Input
          required
          label="Covered from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          required
          label="Covered through"
          type="date"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
        />
        <Input
          required
          label="Employer reference (CURRENT or previous employer)"
          value={employer}
          onChange={(e) => setEmployer(e.target.value)}
        />
        <Input
          label="Recorded TDS (leave blank if not provided)"
          value={tds}
          onChange={(e) => setTds(e.target.value)}
        />
      </div>
      <label className="block">
        Actual earnings by component
        <textarea
          required
          className="block w-full rounded border p-2"
          rows={4}
          placeholder={'BASIC=25000\nHRA=10000'}
          value={components}
          onChange={(e) => setComponents(e.target.value)}
        />
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={complete} onChange={(e) => setComplete(e.target.checked)} />
        HR confirms complete deduction coverage for this period
      </label>
      <Input
        required
        label="History source / correction reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={2000}
      />
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>
        Save recorded history
      </Button>
    </form>
  );
};
export default TaxHistoryEditor;
