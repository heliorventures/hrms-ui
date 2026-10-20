import { useState } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

import ConfirmOrganizationAction from './ConfirmOrganizationAction';
import { createCommandIntent } from './organizationCommand';
import type { OrganizationRecord } from './organizationDocuments';
import { records, text } from './organizationHrModel';
import { resourcePending } from './organizationResource';
import OrganizationSourceForm, { type SourceField } from './OrganizationSourceForm';
import type { OrganizationScope } from './organizationTypes';

interface Step {
  key: string;
  step_name: string;
  approver_type: string;
  can_skip: boolean;
  sla_hours: string;
}
const choices = (values: string[]) =>
  values.map((value) => ({ value, label: value.replace(/_/g, ' ') }));
const newStep = (): Step => ({
  key: crypto.randomUUID(),
  step_name: '',
  approver_type: 'REPORTING_MANAGER',
  can_skip: false,
  sla_hours: '',
});
const initialSteps = (record: OrganizationRecord) =>
  record.steps
    ? records(record.steps).map((step) => ({
        key: crypto.randomUUID(),
        step_name: text(step, 'step_name'),
        approver_type: text(step, 'approver_type'),
        can_skip: step.can_skip === true,
        sla_hours: typeof step.sla_hours === 'number' ? String(step.sla_hours) : '',
      }))
    : [newStep()];

const validSteps = (steps: Step[]) =>
  steps.length > 0 &&
  steps.length <= 50 &&
  steps.every(
    (step) => step.step_name.trim() && step.step_name.length <= 200 && validHours(step.sla_hours)
  );
const validHours = (hours: string) =>
  !hours || (/^[1-9]\d*$/.test(hours) && Number(hours) <= 2147483647);

function workflowFields(record: OrganizationRecord): SourceField[] {
  const entities = text(record, 'workflow_id')
    ? [text(record, 'entity_type')]
    : ['LEAVE_REQUEST', 'EXPENSE', 'TRAVEL_REQUEST', 'TIMESHEET_WEEK_BATCH', 'LOAN_REQUEST'];
  return [
    { key: 'name', label: 'Workflow name', required: true, value: text(record, 'name') },
    {
      key: 'entity_type',
      label: 'Request type',
      required: true,
      value: text(record, 'entity_type') || 'LEAVE_REQUEST',
      options: choices(entities),
    },
  ];
}

const WorkflowStep = ({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: Step;
  index: number;
  onChange: (step: Step) => void;
  onRemove: () => void;
}) => (
  <fieldset className="space-y-2 rounded-lg border border-line p-3">
    <legend>Approval step {index + 1}</legend>
    <Input
      label="Step name"
      required
      maxLength={200}
      value={step.step_name}
      onChange={(event) => onChange({ ...step, step_name: event.target.value })}
    />
    <Select
      label="Approver"
      value={step.approver_type}
      options={choices(['REPORTING_MANAGER', 'PERMISSION', 'REPORTING_MANAGER_OR_PERMISSION'])}
      onChange={(event) => onChange({ ...step, approver_type: event.target.value })}
    />
    <Input
      label="Service target hours"
      type="number"
      min="1"
      max="2147483647"
      step="1"
      value={step.sla_hours}
      onChange={(event) => onChange({ ...step, sla_hours: event.target.value })}
    />
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={step.can_skip}
        onChange={(event) => onChange({ ...step, can_skip: event.target.checked })}
      />
      Allow this step to be skipped
    </label>
    <Button variant="quiet" size="sm" onClick={onRemove}>
      Remove step
    </Button>
  </fieldset>
);

const OrganizationWorkflowEditor = ({
  scope,
  record,
  version,
  onSaved,
}: {
  scope: OrganizationScope;
  record: OrganizationRecord;
  version: number;
  onSaved: () => void;
}) => {
  const [steps, setSteps] = useState<Step[]>(() => initialSteps(record));
  const { company } = scope;
  if (!company) return null;
  const id = text(record, 'workflow_id');
  const busy = id ? resourcePending(scope, company.membershipId, id) : false;
  const save = async (values: Record<string, string>) => {
    if (!validSteps(steps)) return;
    await scope.commands.submit(
      scope.organization.id,
      company.name,
      createCommandIntent(
        company.membershipId,
        'workflow_save',
        id || crypto.randomUUID(),
        version,
        {
          ...values,
          is_active: record.is_active === true,
          steps: steps.map((step) => ({
            step_name: step.step_name,
            approver_type: step.approver_type,
            can_skip: step.can_skip,
            sla_hours: step.sla_hours ? Number(step.sla_hours) : null,
          })),
        }
      )
    );
    onSaved();
  };
  const activate = async () => {
    await scope.commands.submit(
      scope.organization.id,
      company.name,
      createCommandIntent(company.membershipId, 'workflow_activation', id, version, {
        is_active: record.is_active !== true,
      })
    );
    onSaved();
  };
  return (
    <div className="space-y-4">
      <p className="text-sm">
        Approver permission follows the request type. The source preserves definitions with
        execution history.
      </p>
      {steps.map((step, index) => (
        <WorkflowStep
          key={step.key}
          step={step}
          index={index}
          onChange={(changed) =>
            setSteps((current) =>
              current.map((item) => (item.key === changed.key ? changed : item))
            )
          }
          onRemove={() => setSteps((current) => current.filter((item) => item.key !== step.key))}
        />
      ))}
      <Button
        variant="outline"
        disabled={steps.length >= 50}
        onClick={() => setSteps((current) => [...current, newStep()])}
      >
        Add approval step
      </Button>
      {!validSteps(steps) ? (
        <p role="status">
          Name every approval step and use whole positive service target hours before saving.
        </p>
      ) : null}
      <OrganizationSourceForm
        busy={busy}
        disabled={!validSteps(steps)}
        fields={workflowFields(record)}
        label="Save source workflow definition"
        onSubmit={save}
      />
      {id ? (
        <ConfirmOrganizationAction
          label={
            record.is_active === true ? 'Deactivate source workflow' : 'Activate source workflow'
          }
          description="Change this workflow's activation in the selected source company. The source enforces one active definition for each request type."
          busy={busy}
          onConfirm={() => {
            void activate();
          }}
        />
      ) : null}
    </div>
  );
};

export default OrganizationWorkflowEditor;
