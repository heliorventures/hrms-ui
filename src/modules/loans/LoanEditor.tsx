import { useRef, useState, type FormEvent } from 'react';

import Button from '../../components/common/Button';
import FeedbackToast from '../../components/common/FeedbackToast';
import Modal from '../../components/common/Modal';
import { useActionFeedback } from '../../hooks/useActionFeedback';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import LoanEditorPreview from './LoanEditorPreview';
import LoanFields from './LoanFields';
import { validateLoanFields, type LoanEditorDefinition } from './loanForm';

interface Props {
  definition: LoanEditorDefinition;
  onClose: () => void;
  onSaved: () => Promise<void>;
}
const LoanEditor = ({ definition, onClose, onSaved }: Props) => {
  const client = useGraphClient();
  const notify = useActionFeedback();
  const [values, setValues] = useState(() => ({
    ...Object.fromEntries(definition.fields.map((field) => [field.key, ''])),
    ...definition.values,
  }));
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projection, setProjection] = useState<unknown>(null);
  const running = useRef(false);
  const attempt = useRef({ signature: '', key: '' });
  const preview = async () => {
    running.current = true;
    setBusy(true);
    try {
      if (definition.preview) setProjection(await definition.preview(values, client));
      setReviewing(true);
      setError(null);
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (running.current) return;
    const issue = validateLoanFields(definition.fields, values) ?? definition.validate?.(values);
    if (issue) {
      setError(issue);
      return;
    }
    if (!reviewing) {
      await preview();
      return;
    }
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      if (!recorded) {
        const input = definition.build(values, projection);
        const signature = JSON.stringify(input);
        if (attempt.current.signature !== signature)
          attempt.current = { signature, key: crypto.randomUUID() };
        await client.request(definition.document, {
          input: {
            ...input,
            meta: { idempotencyKey: attempt.current.key, expectedVersion: definition.version },
          },
        });
        setRecorded(true);
        notify('saved');
      }
      await onSaved();
      onClose();
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={definition.title}
      description={definition.description}
      size="lg"
      isDismissible={!busy}
    >
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        {error && (
          <FeedbackToast>
            {recorded ? `Recorded successfully. Refresh failed: ${error}` : error}
          </FeedbackToast>
        )}
        <fieldset disabled={busy || recorded || reviewing}>
          <LoanFields
            fields={definition.fields}
            values={values}
            onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
          />
        </fieldset>
        {reviewing && projection !== null && (
          <LoanEditorPreview definition={definition} projection={projection} />
        )}
        {reviewing && (
          <p className="text-sm text-content-secondary">
            Review every value before confirming. The server validates company policy and current
            balances.
          </p>
        )}
        <div className="flex justify-end gap-2">
          {reviewing && !recorded && (
            <Button variant="secondary" disabled={busy} onClick={() => setReviewing(false)}>
              Edit values
            </Button>
          )}
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {submitLabel(busy, recorded, reviewing)}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default LoanEditor;

function submitLabel(busy: boolean, recorded: boolean, reviewing: boolean) {
  if (busy) return 'Saving…';
  if (recorded) return 'Refresh records';
  if (reviewing) return 'Confirm and save';
  return 'Review values';
}
