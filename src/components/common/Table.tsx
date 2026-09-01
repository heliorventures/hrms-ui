import { ReactNode } from 'react';
import { UI_EMPTY_TEXT, UI_STATUS_TEXT } from '../../constants/uiText';
import DataTable, { type DataTableColumn } from './DataTable';

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  errorMessage?: string | null;
  loading?: boolean;
  loadingMessage?: string;
  ariaLabel?: string;
}

const Table = <T,>({
  data,
  columns,
  keyExtractor,
  emptyMessage = UI_EMPTY_TEXT.records,
  errorMessage = null,
  loading = false,
  loadingMessage = UI_STATUS_TEXT.loading,
  ariaLabel = 'Records',
}: TableProps<T>) => {
  const dataTableColumns: DataTableColumn<T>[] = columns.map((column) => ({
    id: String(column.key),
    header: column.label,
    cell: column.render ?? ((item) => String(item[column.key as keyof T])),
  }));
  const state = loading ? 'loading' : errorMessage ? 'error' : data.length === 0 ? 'empty' : 'ready';
  const stateMessage = loading ? loadingMessage : errorMessage || emptyMessage;

  return <DataTable ariaLabel={ariaLabel} rows={data} columns={dataTableColumns} getRowId={keyExtractor} state={state} stateMessage={stateMessage} />;
};

export default Table;
