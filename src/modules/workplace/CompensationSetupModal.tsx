import { useRef, useState } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import {
  saveCompensationCycleDocument,
  saveSalaryBandDocument,
  validateCompensationSetup,
  type CompensationSetupKind,
  type CompensationSetupValues,
} from './compensationSetup';

const CompensationSetupModal = ({
  kind,
  initial,
  designations,
  onClose,
  onSaved,
}: {
  kind: CompensationSetupKind;
  initial?: CompensationSetupValues;
  designations: { id: string; title: string }[];
  onClose: () => void;
  onSaved: () => void;
}) => {
  const client = useGraphClient('client');
  const [values, setValues] = useState<CompensationSetupValues>(initial ?? {});
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const fields =
    kind === 'cycle'
      ? [
          ['name', 'Name', 'text'],
          ['year', 'Year', 'number'],
          ['startDate', 'Start date', 'date'],
          ['endDate', 'End date', 'date'],
          ['budgetPercentage', 'Budget percentage', 'text'],
        ]
      : [
          ['grade', 'Grade', 'number'],
          ['minSalary', 'Minimum salary', 'text'],
          ['midSalary', 'Midpoint salary', 'text'],
          ['maxSalary', 'Maximum salary', 'text'],
          ['currency', 'Currency code', 'text'],
          ['effectiveYear', 'Effective year', 'number'],
        ];
  const label = kind === 'cycle' ? 'Review Cycle' : 'Salary Band';
  return (
    <Modal
      isOpen
      onClose={onClose}
      isDismissible={!busy}
      title={`${initial ? 'Edit' : 'Create'} ${label}`}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void (async () => {
            if (lock.current) return;
            const validation = validateCompensationSetup(kind, values);
            if (validation) {
              setError(validation);
              return;
            }
            lock.current = true;
            setBusy(true);
            setError(null);
            try {
              const input: Record<string, string | number | null> = {};
              if (values.id) input.id = values.id;
              for (const [key] of fields) {
                const value = values[key]?.trim();
                input[key] = value
                  ? ['year', 'grade', 'effectiveYear'].includes(key)
                    ? Number(value)
                    : value
                  : null;
              }
              if (kind === 'band') input.designationId = values.designationId ?? '';
              await client.request<{
                saveCompensationReviewCycle?: { id: string };
                saveSalaryBand?: { id: string };
              }>(kind === 'cycle' ? saveCompensationCycleDocument : saveSalaryBandDocument, {
                input,
              });
              onSaved();
            } catch (err) {
              setError(graphQlUserMessage(err));
            } finally {
              lock.current = false;
              setBusy(false);
            }
          })();
        }}
      >
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
          {kind === 'band' && (
            <div className="sm:col-span-2">
              <Select
                label="Designation"
                required
                fullWidth
                value={values.designationId ?? ''}
                onChange={(e) => setValues({ ...values, designationId: e.target.value })}
                options={[
                  { value: '', label: 'Select designation' },
                  ...(initial?.designationId &&
                  !designations.some((d) => d.id === initial.designationId)
                    ? [{ value: initial.designationId, label: 'Current designation' }]
                    : []),
                  ...designations.map((d) => ({ value: d.id, label: d.title })),
                ]}
              />
            </div>
          )}
          {fields.map(([key, title, type]) => (
            <Input
              key={key}
              label={title}
              fullWidth
              className="mt-1 block w-full rounded border p-2 dark:bg-slate-800"
              type={type}
              required={kind === 'cycle' && key !== 'budgetPercentage'}
              maxLength={key === 'name' ? 200 : undefined}
              value={values[key] ?? ''}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            />
          ))}
        </fieldset>
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" busy={busy}>
            Save {label}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompensationSetupModal;
