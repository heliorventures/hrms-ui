import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';

import { MANDATORY_FIELDS } from './prejoiningAdminHelpers';
import type { PrejoiningDocumentRequirement, PrejoiningField } from './prejoiningAdminTypes';
import type { PrejoiningAdminModel } from './usePrejoiningAdminModel';

export const PersonalFieldOption = ({
  model,
  field,
}: {
  model: PrejoiningAdminModel;
  field: PrejoiningField;
}) => {
  const { config, setConfig } = model;
  const configured = config.fields.find((item) => item.key === field.key);
  const mandatory = MANDATORY_FIELDS.has(field.key);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-sm">
      <label className="flex min-h-8 items-center gap-2">
        <input
          type="checkbox"
          checked={mandatory || Boolean(configured)}
          disabled={mandatory}
          onChange={(event) =>
            setConfig((current) => ({
              ...current,
              fields: event.target.checked
                ? [...current.fields, field]
                : current.fields.filter((item) => item.key !== field.key),
            }))
          }
        />
        <span>
          {field.label}
          {mandatory ? ' (required)' : ''}
        </span>
      </label>
      {configured && !mandatory ? (
        <label className="flex min-h-8 items-center gap-2 text-content-secondary">
          <input
            type="checkbox"
            aria-label={`Require ${field.label}`}
            checked={configured.required}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                fields: current.fields.map((item) =>
                  item.key === field.key ? { ...item, required: event.target.checked } : item
                ),
              }))
            }
          />
          Required
        </label>
      ) : null}
    </div>
  );
};

export const DocumentRequirementOption = ({
  model,
  requirement,
  index,
}: {
  model: PrejoiningAdminModel;
  requirement: PrejoiningDocumentRequirement;
  index: number;
}) => {
  const { setConfig, documentTypes } = model;
  const update = (changes: Partial<PrejoiningDocumentRequirement>) =>
    setConfig((current) => ({
      ...current,
      documents: current.documents.map((item) =>
        item.id === requirement.id ? { ...item, ...changes } : item
      ),
    }));
  return (
    <div className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-[1fr_1fr_auto]">
      <Select
        label={`Document type ${index + 1}`}
        options={[
          { value: '', label: 'Select document type' },
          ...documentTypes.map((row) => ({ value: row.id, label: row.label })),
        ]}
        value={requirement.documentTypeId}
        onChange={(event) =>
          update({
            documentTypeId: event.target.value,
            label:
              documentTypes.find((row) => row.id === event.target.value)?.label ??
              requirement.label,
          })
        }
      />
      <Input
        label={`Candidate label ${index + 1}`}
        value={requirement.label}
        onChange={(event) => update({ label: event.target.value })}
      />
      <div className="flex items-center gap-3">
        <label className="flex min-h-10 items-center gap-2 text-sm">
          <input
            type="checkbox"
            aria-label={`Require document ${index + 1}`}
            checked={requirement.required}
            onChange={(event) => update({ required: event.target.checked })}
          />
          Required
        </label>
        <Button
          variant="quiet"
          onClick={() =>
            setConfig((current) => ({
              ...current,
              documents: current.documents.filter((item) => item.id !== requirement.id),
            }))
          }
        >
          Remove
        </Button>
      </div>
    </div>
  );
};
