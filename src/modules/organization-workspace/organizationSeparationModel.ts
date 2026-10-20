import { optionalString, requiredString, type OrganizationRecord } from './organizationDocuments';

export function separationSubjectRow(record: OrganizationRecord): OrganizationRecord {
  const name = optionalString(record, 'employee_name');
  const code = optionalString(record, 'employee_code');
  let subject = name ?? code;
  if (name && code) subject = `${name} (${code})`;
  return {
    ...record,
    employee_subject: subject ?? `Employee reference: ${requiredString(record, 'employee_id')}`,
  };
}
