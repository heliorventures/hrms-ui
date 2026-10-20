import { asRecord, displayValue, type OrganizationRecord } from './organizationDocuments';

const OMIT = new Set([
  'id',
  'version',
  'command_id',
  'configuration_hash',
  'expected_workflow_step_id',
]);
const label = (key: string) => key.replace(/_/g, ' ').replace(/^./, (first) => first.toUpperCase());
const valuesWithKeys = (values: unknown[]) => {
  const occurrences = new Map<string, number>();
  return values.map((value) => {
    const identity = JSON.stringify(value);
    const occurrence = (occurrences.get(identity) ?? 0) + 1;
    occurrences.set(identity, occurrence);
    return { value, key: `${identity}|${occurrence}` };
  });
};

const BusinessValue = ({ value }: { value: unknown }) => {
  if (Array.isArray(value))
    return (
      <ul className="space-y-2">
        {valuesWithKeys(value).map((item) => (
          <li key={item.key} className="rounded border border-line-subtle p-2">
            <BusinessValue value={item.value} />
          </li>
        ))}
      </ul>
    );
  if (value !== null && typeof value === 'object')
    return <BusinessRecordDetails record={asRecord(value)} />;
  return <span className="whitespace-pre-wrap break-words">{displayValue(value)}</span>;
};

const BusinessRecordDetails = ({ record }: { record: OrganizationRecord }) => (
  <dl className="space-y-2 text-sm">
    {Object.entries(record)
      .filter(([key]) => !OMIT.has(key))
      .map(([key, value]) => (
        <div key={key} className="space-y-1">
          <dt className="font-medium text-content-secondary">{label(key)}</dt>
          <dd>
            <BusinessValue value={value} />
          </dd>
        </div>
      ))}
  </dl>
);

export default BusinessRecordDetails;
