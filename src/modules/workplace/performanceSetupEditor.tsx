import { useRef, useState, type FormEvent } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

export type SetupField = {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'checkbox';
  required?: boolean;
  maxLength?: number;
};
export const SetupEditor = ({
  title,
  fields,
  initial,
  onSave,
  onClose,
}: {
  title: string;
  fields: SetupField[];
  initial: Record<string, string | boolean>;
  onSave: (values: Record<string, string | boolean>) => Promise<void>;
  onClose: () => void;
}) => {
  const [values, setValues] = useState(initial);
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError('End date must be on or after start date.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      await onSave(values);
      onClose();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <Modal isOpen title={title} onClose={onClose} isDismissible={!busy}>
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {fields.map((field) =>
          field.type === 'checkbox' ? (
            <label key={field.key} className="flex min-h-11 items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={Boolean(values[field.key])}
                disabled={busy}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.checked })}
              />
              {field.label}
            </label>
          ) : (
            <Input
              key={field.key}
              label={field.label}
              fullWidth
              type={field.type ?? 'text'}
              required={field.required}
              maxLength={field.maxLength}
              min={field.type === 'number' ? 1 : undefined}
              step={field.type === 'number' ? 1 : undefined}
              value={String(values[field.key] ?? '')}
              disabled={busy}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            />
          )
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy} type="submit">
            {busy ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
