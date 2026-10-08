import { useRef, useState } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import {
  saveCompetencyDocument,
  saveTalentPoolDocument,
  type SuccessionSetupValues,
} from './successionSetup';

const SuccessionSetupModal = ({
  kind,
  initial,
  onClose,
  onSaved,
}: {
  kind: 'competency' | 'pool';
  initial?: SuccessionSetupValues;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const client = useGraphClient('client');
  const [values, setValues] = useState<SuccessionSetupValues>(
    initial ?? { name: '', category: '', description: '' }
  );
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const label = kind === 'competency' ? 'Competency' : 'Talent Pool';
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
            if (!values.name.trim()) {
              setError('Enter a name.');
              return;
            }
            lock.current = true;
            setBusy(true);
            setError(null);
            try {
              const input = {
                id: values.id,
                name: values.name.trim(),
                description: values.description?.trim() || null,
                ...(kind === 'competency' ? { category: values.category?.trim() || null } : {}),
              };
              await client.request<{
                saveCompetency?: { id: string };
                saveTalentPool?: { id: string };
              }>(kind === 'competency' ? saveCompetencyDocument : saveTalentPoolDocument, {
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
        <fieldset disabled={busy} className="space-y-4">
          <Input
            label="Name"
            fullWidth
            required
            maxLength={200}
            className="mt-1 block w-full rounded border p-2 dark:bg-slate-800"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
          {kind === 'competency' && (
            <label className="block text-sm">
              Category
              <input
                maxLength={100}
                className="mt-1 block w-full rounded border p-2 dark:bg-slate-800"
                value={values.category ?? ''}
                onChange={(e) => setValues({ ...values, category: e.target.value })}
              />
            </label>
          )}
          <label className="block text-sm">
            Description
            <textarea
              maxLength={10000}
              className="mt-1 block w-full rounded border p-2 dark:bg-slate-800"
              value={values.description ?? ''}
              onChange={(e) => setValues({ ...values, description: e.target.value })}
            />
          </label>
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

export default SuccessionSetupModal;
