import type { HistoryArchive } from './organizationArchiveModel';
import OrganizationRecordTable from './OrganizationRecordTable';

const OrganizationArchiveRecords = ({ archive }: { archive: HistoryArchive }) => (
  <>
    <OrganizationRecordTable
      label="History archive manifest"
      rows={[archive.manifest]}
      fields={[
        { key: 'id', label: 'Archive reference' },
        { key: 'history_from', label: 'From' },
        { key: 'history_through', label: 'Through' },
        { key: 'row_count', label: 'Records' },
        { key: 'plaintext_sha256', label: 'Content checksum' },
        { key: 'ciphertext_sha256', label: 'Stored archive checksum' },
        { key: 'key_version', label: 'Encryption key version' },
      ]}
    />
    <OrganizationRecordTable
      label="Permitted archived business history"
      rows={archive.items}
      fields={[
        { key: 'occurred_at', label: 'Occurred at' },
        { key: 'event_type', label: 'Event' },
        { key: 'aggregate_type', label: 'Resource type' },
        { key: 'aggregate_version', label: 'Source version' },
      ]}
    />
  </>
);

export default OrganizationArchiveRecords;
