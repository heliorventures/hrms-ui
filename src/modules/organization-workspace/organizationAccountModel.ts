import type { OrganizationRecord } from './organizationDocuments';
import { text } from './organizationHrModel';
import type { SourceField } from './OrganizationSourceForm';

export function accountFields(record: OrganizationRecord | null): SourceField[] {
  const fields: SourceField[] = [
    {
      key: 'username',
      label: 'Username',
      required: true,
      value: record ? text(record, 'username') : '',
    },
    { key: 'email', label: 'Email', type: 'email', value: record ? text(record, 'email') : '' },
  ];
  if (!record)
    fields.push({
      key: 'initial_password',
      label: 'Initial password',
      type: 'password',
      required: true,
      minLength: 8,
    });
  return fields;
}

export function initialAccountRoles(record: OrganizationRecord | null): string[] {
  if (!record || !Array.isArray(record.role_ids)) return [];
  return record.role_ids.filter((id): id is string => typeof id === 'string');
}
