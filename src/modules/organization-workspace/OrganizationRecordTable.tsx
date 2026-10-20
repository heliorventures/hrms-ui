import type { ReactNode } from 'react';

import DataTable from '../../components/common/DataTable';
import type { DataTableColumn } from '../../components/common/DataTable';

import { displayValue, requiredString, type OrganizationRecord } from './organizationDocuments';

interface Field {
  key: string;
  label: string;
}
interface Props {
  label: string;
  rows: OrganizationRecord[];
  fields: readonly Field[];
  idKey?: string;
  requireSourceVersion?: boolean;
  renderAction?: (record: OrganizationRecord) => ReactNode;
}

const RecordActionCell = ({
  row,
  renderAction,
  requireSourceVersion,
}: {
  row: OrganizationRecord;
  renderAction: NonNullable<Props['renderAction']>;
  requireSourceVersion: boolean;
}) => {
  if (
    requireSourceVersion &&
    (typeof row.version !== 'number' || !Number.isSafeInteger(row.version) || row.version <= 0)
  )
    return (
      <p className="text-sm">Source version unavailable. Refresh records before making changes.</p>
    );
  return renderAction(row);
};

function recordColumns(
  fields: readonly Field[],
  renderAction: Props['renderAction'],
  requireSourceVersion: boolean
): DataTableColumn<OrganizationRecord>[] {
  const columns: DataTableColumn<OrganizationRecord>[] = fields.map((field) => ({
    id: field.key,
    header: field.label,
    cell: (row: OrganizationRecord) => displayValue(row[field.key]),
  }));
  if (renderAction)
    columns.push({
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <RecordActionCell
          row={row}
          renderAction={renderAction}
          requireSourceVersion={requireSourceVersion}
        />
      ),
    });
  return columns;
}

const OrganizationRecordTable = ({
  label,
  rows,
  fields,
  idKey = 'id',
  renderAction,
  requireSourceVersion = true,
}: Props) => {
  return (
    <DataTable
      ariaLabel={label}
      rows={rows}
      getRowId={(row) => requiredString(row, idKey)}
      columns={recordColumns(fields, renderAction, requireSourceVersion)}
    />
  );
};

export default OrganizationRecordTable;
