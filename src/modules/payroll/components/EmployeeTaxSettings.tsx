import { useState, type FormEvent } from 'react';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { taxFormErrorMessage } from '../taxFormError';
import { taxSettingsInput } from '../taxFormInputs';
import type { TaxSettingsInput, TaxSettingsVersion } from '../taxProjectionTypes';

interface Props {
  current: TaxSettingsVersion | null;
  busy: boolean;
  onSave: (value: TaxSettingsInput) => void;
}
const residencyValue = (value: boolean | null | undefined) =>
  typeof value === 'boolean' ? String(value) : '';
const EmployeeTaxSettings = ({ current, busy, onSave }: Props) => {
  const [regime, setRegime] = useState(current?.input.regime ?? '');
  const [method, setMethod] = useState(current?.input.method ?? 'ANNUAL_PROJECTION');
  const [rate, setRate] = useState(
    current?.input.percentage ? String(Number(current.input.percentage) * 100) : ''
  );
  const [basis, setBasis] = useState(current?.input.basis_components.join(', ') ?? '');
  const [from, setFrom] = useState('');
  const [until, setUntil] = useState('');
  const [resident, setResident] = useState(residencyValue(current?.input.resident));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const override = method === 'PERCENTAGE_OVERRIDE';
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      onSave(taxSettingsInput({ regime, method, rate, basis, from, until, resident, reason }));
    } catch (cause) {
      setError(taxFormErrorMessage(cause));
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3" data-tour-anchor="payroll.tax.employee-settings">
      <h3 className="font-semibold">Employee tax settings</h3>
      <p className="text-sm text-slate-600">
        Save a new effective period. Finalized payslips stay unchanged. Percentage withholding
        requires an HR reason; annual tax is shown separately.
      </p>
      {current && (
        <p className="text-sm">
          Latest revision {current.revision}, effective {current.input.effective_from}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          Annual tax regime
          <select
            required
            className="block w-full rounded border p-2"
            value={regime}
            onChange={(e) => setRegime(e.target.value)}
          >
            <option value="">Select regime</option>
            <option value="NEW">New regime</option>
            <option value="OLD">Old regime</option>
          </select>
        </label>
        <label>
          Withholding method
          <select
            className="block w-full rounded border p-2"
            value={method}
            onChange={(e) => setMethod(e.target.value as TaxSettingsInput['method'])}
          >
            <option value="ANNUAL_PROJECTION">Annual projection</option>
            <option value="PERCENTAGE_OVERRIDE">Percentage override</option>
          </select>
        </label>
        <label>
          Tax residency
          <select
            className="block w-full rounded border p-2"
            value={resident}
            onChange={(e) => setResident(e.target.value)}
          >
            <option value="">Not provided</option>
            <option value="true">Resident</option>
            <option value="false">Non-resident — review required</option>
          </select>
        </label>
        <Input
          required
          label="Effective from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          label="Effective until (optional)"
          type="date"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
        />
        {override && (
          <>
            <Input
              required
              label="Withholding percentage"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <Input
              required
              label="Basis component codes (comma separated)"
              value={basis}
              onChange={(e) => setBasis(e.target.value)}
            />
          </>
        )}
      </div>
      <Input
        required={override}
        label="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={2000}
      />
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save future settings'}
      </Button>
    </form>
  );
};
export default EmployeeTaxSettings;
