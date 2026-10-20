import { useState } from 'react';

import { ProposeOrganizationRelationshipDocument } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

import { requiredString, type OrganizationRecord } from './organizationDocuments';
import OrganizationEmploymentPicker from './OrganizationEmploymentPicker';
import type { OrganizationScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';

const TYPES = [
  { value: 'PRIMARY', label: 'Primary reporting manager' },
  { value: 'DOTTED_LINE', label: 'Dotted-line manager' },
  { value: 'PROJECT', label: 'Project manager' },
  { value: 'REVIEWER', label: 'Performance reviewer' },
];
const CAPABILITIES = [
  'employee:read',
  'leave:read',
  'leave:approve',
  'timesheet:read',
  'timesheet:approve',
  'performance:read',
  'performance:evaluate',
  'feedback:write',
];
interface Props {
  scope: OrganizationScope;
  graphVersion: number;
}
const OrganizationRelationshipEditor = ({ scope, graphVersion }: Props) => {
  const [subject, setSubject] = useState<OrganizationRecord | null>(null);
  const [manager, setManager] = useState<OrganizationRecord | null>(null);
  const [type, setType] = useState('PRIMARY');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const action = useOrganizationAction(scope.refreshAccess);
  const toggle = (code: string, enabled: boolean) =>
    setCapabilities((previous) =>
      enabled ? [...previous, code] : previous.filter((item) => item !== code)
    );
  const propose = () => {
    if (subject && manager)
      void action.run(() =>
        scope.client.request(ProposeOrganizationRelationshipDocument, {
          organizationId: scope.organization.id,
          expectedGraphVersion: graphVersion,
          subjectEmploymentRefId: requiredString(subject, 'id'),
          managerEmploymentRefId: requiredString(manager, 'id'),
          relationshipType: type,
          effectiveFrom: new Date(from).toISOString(),
          effectiveTo: to ? new Date(to).toISOString() : null,
          capabilities,
        })
      );
  };
  return (
    <Card title="Assign a manager across companies">
      <p className="mb-3 text-sm text-content-secondary">
        Synchronize the verified directory of every active company to completion before proposing a
        relationship. This includes existing reporting managers in the organization graph.
      </p>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          propose();
        }}
      >
        <OrganizationEmploymentPicker
          scope={scope}
          label="Subject employee"
          value={subject ? requiredString(subject, 'id') : ''}
          onChange={setSubject}
        />
        <OrganizationEmploymentPicker
          scope={scope}
          label="Manager employment"
          value={manager ? requiredString(manager, 'id') : ''}
          onChange={setManager}
        />
        <Select
          label="Relationship purpose"
          value={type}
          onChange={(event) => setType(event.target.value)}
          options={TYPES}
        />
        <div className="flex flex-wrap gap-3">
          <Input
            label="Effective from (your local time)"
            type="datetime-local"
            required
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
          <Input
            label="Effective until (your local time)"
            type="datetime-local"
            value={to}
            min={from}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-2 font-medium">Explicit manager capabilities</legend>
          {CAPABILITIES.map((code) => (
            <label key={code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={capabilities.includes(code)}
                onChange={(event) => toggle(code, event.target.checked)}
              />
              {code}
            </label>
          ))}
        </fieldset>
        <p className="text-sm text-content-secondary">
          Primary reporting is checked across people and effective dates. Different companies may
          manage each other&apos;s employees; an employee reporting cycle is forbidden. The
          assignment becomes usable only after source installation.
        </p>
        {action.error ? <p role="alert">{action.error}</p> : null}
        <Button
          type="submit"
          busy={action.busy}
          disabled={!subject || !manager || subject.id === manager.id || capabilities.length === 0}
        >
          Reserve and validate relationship
        </Button>
      </form>
    </Card>
  );
};

export default OrganizationRelationshipEditor;
