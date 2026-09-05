import { useRef, useState, type FormEvent } from 'react';
import { gql } from 'graphql-request';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
export const SaveBenefitType = gql`
  mutation SaveBenefitType($id: ID, $input: BenefitTypeInput!) {
    saveBenefitType(id: $id, input: $input) {
      id
    }
  }
`;
export const SaveBenefitPlan = gql`
  mutation SaveBenefitPlan($id: ID, $input: BenefitPlanInput!) {
    saveBenefitPlan(id: $id, input: $input) {
      id
    }
  }
`;
export type SetupField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'checkbox' | 'textarea';
  required?: boolean;
  maxLength?: number;
  step?: string;
  options?: { value: string; label: string }[];
};
export type SetupValues = Record<string, string | number | boolean | null>;
export type SetupEditor = {
  title: string;
  id?: string;
  mutation: string;
  fields: SetupField[];
  values: SetupValues;
  validate?: (values: SetupValues) => string | null;
};
export function SetupModal({
  editor,
  onClose,
  onSaved,
}: {
  editor: SetupEditor;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const client = useGraphClient('client');
  const [values, setValues] = useState(editor.values);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    const missingField = editor.fields.find(
      (field) =>
        field.required && (values[field.name] == null || String(values[field.name]).trim() === '')
    );
    if (missingField) {
      setError(`Enter ${missingField.label.toLowerCase()}.`);
      return;
    }
    const issue = editor.validate?.(values);
    if (issue) {
      setError(issue);
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      if (!saved) {
        const input = Object.fromEntries(
          Object.entries(values).map(([key, value]) => [
            key,
            typeof value === 'string' ? value.trim() || null : value,
          ])
        );
        await client.request<{ [key: string]: { id: string } }>(editor.mutation, {
          id: editor.id ?? null,
          input,
        });
        setSaved(true);
      }
      await onSaved();
      onClose();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} title={editor.title} isDismissible={!busy}>
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {saved ? 'Saved successfully. Refresh failed: ' : ''}
            {error}
          </p>
        )}
        <fieldset disabled={busy || saved} className="space-y-4">
          {editor.fields.map((field) => (
            <div key={field.name}>
              {field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-sm text-content-primary">
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.name])}
                    onChange={(e) => setValues({ ...values, [field.name]: e.target.checked })}
                  />
                  {field.label}
                </label>
              ) : field.options ? (
                <Select
                  label={field.label}
                  required={field.required}
                  fullWidth
                  options={[
                    { value: '', label: `Select ${field.label.toLowerCase()}` },
                    ...field.options,
                  ]}
                  value={String(values[field.name] ?? '')}
                  onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                />
              ) : field.type === 'textarea' ? (
                <label className="block text-sm font-medium text-content-primary">
                  {field.label}
                  <textarea
                    className="mt-1 block w-full rounded-lg border border-line bg-surface p-2"
                    maxLength={field.maxLength}
                    value={String(values[field.name] ?? '')}
                    onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                  />
                </label>
              ) : (
                <Input
                  label={field.label}
                  fullWidth
                  type={field.type ?? 'text'}
                  required={field.required}
                  maxLength={field.maxLength}
                  min={field.type === 'number' ? 0 : undefined}
                  step={field.step}
                  value={String(values[field.name] ?? '')}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      [field.name]:
                        field.name === 'vacancies' ? Number(e.target.value) : e.target.value,
                    })
                  }
                />
              )}
            </div>
          ))}
        </fieldset>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" busy={busy} busyLabel={saved ? 'Refreshing' : 'Saving'}>
            {saved ? 'Retry refresh' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export const benefitTypeFields: SetupField[] = [
  { name: 'name', label: 'Name', required: true, maxLength: 255 },
  { name: 'code', label: 'Code', required: true, maxLength: 50 },
  { name: 'category', label: 'Category', maxLength: 100 },
];

export const BenefitTypeOptionsDocument = gql`
  query BenefitTypeOptions($offset: Int!) {
    benefitTypes(limit: 100, offset: $offset) {
      id
      name
    }
  }
`;
export async function loadBenefitTypeOptions(
  fetchPage: (offset: number) => Promise<{ id: string; name: string }[]>
): Promise<{ value: string; label: string }[]> {
  const options = new Map<string, string>();
  for (let offset = 0; ; offset += 100) {
    const page = await fetchPage(offset);
    page.forEach((type) => options.set(type.id, type.name));
    if (page.length < 100) break;
  }
  return [...options].map(([value, label]) => ({ value, label }));
}
