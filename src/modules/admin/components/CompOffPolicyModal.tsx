import { useId, useState } from 'react';

import Button from '../../../components/common/Button';
import EmployeeSearchSelect from '../../../components/common/EmployeeSearchSelect';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import UuidEntitySearchSelect from '../../../components/common/UuidEntitySearchSelect';
import {
  compOffPolicyInput,
  type CompOffPolicyForm,
  type CompOffSettings,
} from '../compOffPolicyForm';

type FormChange = (values: Partial<CompOffPolicyForm>) => void;
const PolicyScope = ({
  form,
  targets,
  busy,
  change,
}: {
  form: CompOffPolicyForm;
  targets: CompOffSettings['compOffPolicyTargets'];
  busy: boolean;
  change: FormChange;
}) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <label className="space-y-1 text-sm font-medium">
      Applies to
      <select
        className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 md:min-h-9"
        value={form.scope}
        disabled={busy}
        onChange={(event) =>
          change({ scope: event.target.value as CompOffPolicyForm['scope'], scopeId: '' })
        }
      >
        <option value="TENANT">Company default</option>
        <option value="DESIGNATION">Designation</option>
        <option value="EMPLOYEE">Employee</option>
      </select>
    </label>
    {form.scope === 'EMPLOYEE' && (
      <EmployeeSearchSelect
        employees={targets.employees}
        valueId={form.scopeId}
        required
        disabled={busy}
        onChangeId={(scopeId) => change({ scopeId })}
      />
    )}
    {form.scope === 'DESIGNATION' && (
      <UuidEntitySearchSelect
        label="Designation"
        options={targets.designations}
        valueId={form.scopeId}
        required
        disabled={busy}
        onChangeId={(scopeId) => change({ scopeId })}
      />
    )}
  </div>
);

const PolicyLimits = ({
  form,
  busy,
  change,
}: {
  form: CompOffPolicyForm;
  busy: boolean;
  change: FormChange;
}) => (
  <fieldset className="space-y-2 rounded-lg border border-line p-3">
    <legend className="px-1 text-sm font-medium">Optional earning limits</legend>
    <div className="grid gap-3 sm:grid-cols-3">
      <Input
        label="Monthly credit limit"
        type="number"
        min="0.5"
        step="0.5"
        placeholder="No limit"
        value={form.monthly}
        disabled={busy}
        onChange={(event) => change({ monthly: event.target.value })}
      />
      <Input
        label="Yearly credit limit"
        type="number"
        min="0.5"
        step="0.5"
        placeholder="No limit"
        value={form.yearly}
        disabled={busy}
        onChange={(event) => change({ yearly: event.target.value })}
      />
      <Input
        label="Maximum unused days"
        type="number"
        min="0.5"
        step="0.5"
        placeholder="No limit"
        value={form.unused}
        disabled={busy}
        onChange={(event) => change({ unused: event.target.value })}
      />
    </div>
    <p className="text-xs text-content-secondary">
      Leave blank for no limit. Pending and approved future leave count towards unused days.
    </p>
  </fieldset>
);

const CompOffPolicyModal = ({
  initial,
  targets,
  busy,
  error,
  close,
  save,
}: {
  initial: CompOffPolicyForm;
  targets: CompOffSettings['compOffPolicyTargets'];
  busy: boolean;
  error: string | null;
  close: () => void;
  save: (input: Record<string, unknown>) => Promise<boolean>;
}) => {
  const [form, setForm] = useState(initial);
  const formId = useId();
  const change: FormChange = (values) => setForm((previous) => ({ ...previous, ...values }));
  return (
    <Modal
      isOpen
      title={form.id ? 'Edit comp-off policy' : 'New comp-off policy'}
      size="xl"
      onClose={close}
      isDismissible={!busy}
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={formId} busy={busy} busyLabel="Saving…">
            Save policy
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save(compOffPolicyInput(form)).then((saved) => {
            if (saved) close();
          });
        }}
      >
        <PolicyScope form={form} targets={targets} busy={busy} change={change} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Credit validity (days after approval)"
            type="number"
            min="1"
            max="2147483647"
            step="1"
            value={form.validityDays}
            required
            disabled={busy}
            onChange={(event) => change({ validityDays: event.target.value })}
          />
          <Input
            label="Submit claim within (days after work)"
            type="number"
            min="0"
            max="2147483647"
            step="1"
            value={form.claimDeadlineDays}
            required
            disabled={busy}
            onChange={(event) => change({ claimDeadlineDays: event.target.value })}
            description="0 means claims must be submitted on the date worked."
          />
        </div>
        <PolicyLimits form={form} busy={busy} change={change} />
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enabled}
              disabled={busy}
              onChange={(event) => change({ enabled: event.target.checked })}
            />
            Enable comp-off for this scope
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.allowCancel}
              disabled={busy}
              onChange={(event) => change({ allowCancel: event.target.checked })}
            />
            Allow HR to cancel approved future comp-off leave
          </label>
        </div>
        {error && (
          <p role="alert" className="text-sm text-status-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};
export default CompOffPolicyModal;
