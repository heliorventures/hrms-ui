import type { ReactNode } from 'react';

export type DataTableState = 'ready' | 'loading' | 'empty' | 'error' | 'partial';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  mobilePriority?: 'primary' | 'secondary' | 'hidden';
  numeric?: boolean;
}

export interface DataTableProps<T> {
  ariaLabel: string;
  rows: readonly T[];
  columns: readonly DataTableColumn<T>[];
  /** Must return a stable, unique identifier for every rendered row. */
  getRowId: (row: T) => string;
  /** Supplies useful selection labels; opaque row identifiers are never announced. */
  getRowLabel?: (row: T) => string;
  state?: DataTableState;
  stateMessage?: string;
  recoveryAction?: ReactNode;
  sort?: {
    columnId: string;
    direction: 'ascending' | 'descending';
    onChange: (columnId: string) => void;
  };
  pagination?: { page: number; pageCount: number; onPageChange: (page: number) => void };
  selectedRowIds?: ReadonlySet<string>;
  onSelectionChange?: (ids: ReadonlySet<string>) => void;
  renderMobileRow?: (row: T) => ReactNode;
}

const DEFAULT_MESSAGES: Record<Exclude<DataTableState, 'ready'>, string> = {
  loading: 'Loading records.',
  empty: 'No records to display.',
  error: 'Unable to load records.',
  partial: 'Some records could not be loaded.',
};

const resolveState = <T,>(state: DataTableState | undefined, rows: readonly T[]): DataTableState => {
  if (state) {
    return state;
  }
  return rows.length === 0 ? 'empty' : 'ready';
};

const isRowsVisible = (state: DataTableState, rowCount: number) =>
  (state === 'ready' || state === 'partial') && rowCount > 0;

const headerName = (header: string) => header || 'Actions';

const numericClassName = (numeric: boolean | undefined) =>
  numeric ? 'tabular-nums text-right' : 'text-left';

interface SelectionControlProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const SelectionControl = ({ label, checked, onChange }: SelectionControlProps) => (
  <input
    type="checkbox"
    aria-label={label}
    checked={checked}
    onChange={onChange}
    className="size-5 rounded border-line text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
  />
);

interface StateMessageProps {
  state: Exclude<DataTableState, 'ready'>;
  message: string;
  recoveryAction?: ReactNode;
}

const StateMessage = ({ state, message, recoveryAction }: StateMessageProps) => {
  const isError = state === 'error';
  const isWarning = state === 'partial';
  const toneClassName = isError
    ? 'border-status-danger text-status-danger'
    : isWarning
      ? 'border-status-warning text-status-warning'
      : 'border-line text-content-secondary';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? undefined : 'polite'}
      aria-atomic="true"
      className={`rounded-md border bg-surface-raised px-4 py-5 text-center text-sm ${toneClassName}`}
    >
      {isWarning ? <span className="font-semibold">Warning: </span> : null}
      <span>{message}</span>
      {recoveryAction ? <div className="mt-3 flex justify-center">{recoveryAction}</div> : null}
    </div>
  );
};

const hasMobileAlternative = <T,>(columns: readonly DataTableColumn<T>[], renderMobileRow?: (row: T) => ReactNode) =>
  Boolean(renderMobileRow) || columns.some((column) => column.mobilePriority !== undefined);

const DataTable = <T,>({
  ariaLabel,
  rows,
  columns,
  getRowId,
  getRowLabel,
  state,
  stateMessage,
  recoveryAction,
  sort,
  pagination,
  selectedRowIds,
  onSelectionChange,
  renderMobileRow,
}: DataTableProps<T>) => {
  const visualState = resolveState(state, rows);
  const visibleRows = isRowsVisible(visualState, rows.length);
  const selectionEnabled =
    visibleRows && selectedRowIds !== undefined && onSelectionChange !== undefined;
  const selectedIds = selectedRowIds ?? new Set<string>();
  const allVisibleSelected = selectionEnabled && rows.length > 0 && rows.every((row) => selectedIds.has(getRowId(row)));
  const stateCopy = visualState === 'ready' ? '' : stateMessage ?? DEFAULT_MESSAGES[visualState];
  const mobileAlternative = visibleRows && hasMobileAlternative(columns, renderMobileRow);
  const colSpan = Math.max(columns.length + (selectionEnabled ? 1 : 0), 1);

  const requestRowSelection = (row: T) => {
    if (!visibleRows || selectedRowIds === undefined || onSelectionChange === undefined) {
      return;
    }
    const id = getRowId(row);
    const nextIds = new Set(selectedRowIds);
    if (nextIds.has(id)) {
      nextIds.delete(id);
    } else {
      nextIds.add(id);
    }
    onSelectionChange(nextIds);
  };

  const requestVisibleSelection = () => {
    if (!visibleRows || selectedRowIds === undefined || onSelectionChange === undefined) {
      return;
    }
    const nextIds = new Set(selectedRowIds);
    rows.forEach((row) => {
      const id = getRowId(row);
      if (allVisibleSelected) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }
    });
    onSelectionChange(nextIds);
  };

  const isPageChangeAllowed = (nextPage: number) =>
    pagination !== undefined && nextPage >= 1 && nextPage <= pagination.pageCount;

  const renderHeader = (column: DataTableColumn<T>) => {
    const activeSort = column.sortable && sort?.columnId === column.id ? sort.direction : undefined;
    const name = headerName(column.header);
    return (
      <th
        key={column.id}
        scope="col"
        aria-sort={activeSort}
        className={`border-b border-line bg-surface-raised px-3 py-2 text-xs font-semibold uppercase tracking-wide text-content-secondary ${numericClassName(column.numeric)}`}
      >
        {column.sortable && sort ? (
          <button
            type="button"
            aria-label={`Sort by ${name}`}
            onClick={() => sort.onChange(column.id)}
            className="inline-flex min-h-8 items-center gap-1 rounded text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {column.header || <span className="sr-only">Actions</span>}
          </button>
        ) : column.header ? (
          column.header
        ) : (
          <span className="sr-only">Actions</span>
        )}
      </th>
    );
  };

  const renderSelectionCell = (row: T, index: number) => {
    if (!selectionEnabled) {
      return null;
    }
    const id = getRowId(row);
    const label = getRowLabel?.(row) || `row ${index + 1}`;
    return (
      <td className="border-b border-line px-3 py-2">
        <SelectionControl label={`Select ${label}`} checked={selectedIds.has(id)} onChange={() => requestRowSelection(row)} />
      </td>
    );
  };

  const renderDesktopTable = () => (
    <div className={mobileAlternative ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto'}>
      <table className="min-w-full border-separate border-spacing-0 bg-surface text-content-primary">
        <caption className="sr-only">{ariaLabel}</caption>
        <thead>
          <tr>
            {selectionEnabled ? (
              <th scope="col" className="border-b border-line bg-surface-raised px-3 py-2 text-left">
                <SelectionControl label="Select all visible rows" checked={allVisibleSelected} onChange={requestVisibleSelection} />
              </th>
            ) : null}
            {columns.map(renderHeader)}
          </tr>
        </thead>
        <tbody>
          {visibleRows ? (
            rows.map((row, index) => {
              const selected = selectionEnabled && selectedIds.has(getRowId(row));
              return (
                <tr key={getRowId(row)} className={selected ? 'bg-surface-selected' : 'hover:bg-surface-raised'}>
                  {renderSelectionCell(row, index)}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`border-b border-line px-3 py-2 text-sm text-content-primary ${numericClassName(column.numeric)}`}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={colSpan} className="px-4 py-5">
                <StateMessage state={visualState === 'ready' ? 'empty' : visualState} message={visualState === 'ready' ? DEFAULT_MESSAGES.empty : stateCopy} recoveryAction={recoveryAction} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderMobileRows = () => {
    if (!mobileAlternative) {
      return null;
    }
    return (
      <ul aria-label={`${ariaLabel} mobile view`} className="space-y-3 md:hidden">
        {rows.map((row, index) => (
          <li key={getRowId(row)} className="rounded-md border border-line bg-surface-raised p-4 text-content-primary">
            {selectionEnabled ? (
              <div className="mb-3">
                <SelectionControl
                  label={`Select ${getRowLabel?.(row) || `row ${index + 1}`}`}
                  checked={selectedIds.has(getRowId(row))}
                  onChange={() => requestRowSelection(row)}
                />
              </div>
            ) : null}
            {renderMobileRow ? (
              renderMobileRow(row)
            ) : (
              <div className="space-y-2">
                {columns.filter((column) => column.mobilePriority !== 'hidden').map((column) => (
                  <div key={column.id} className={numericClassName(column.numeric)}>
                    <div className="text-xs font-medium text-content-secondary">{headerName(column.header)}</div>
                    <div className="mt-1 text-sm text-content-primary">{column.cell(row)}</div>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const previousPage = pagination?.page === undefined ? undefined : pagination.page - 1;
  const nextPage = pagination?.page === undefined ? undefined : pagination.page + 1;

  return (
    <section aria-label={ariaLabel} className="space-y-3">
      {renderDesktopTable()}
      {visibleRows ? renderMobileRows() : null}
      {visualState === 'partial' && visibleRows ? (
        <StateMessage state="partial" message={stateCopy} recoveryAction={recoveryAction} />
      ) : null}
      {pagination && (visibleRows || visualState === 'ready') ? (
        <nav aria-label={`${ariaLabel} pagination`} className="flex items-center justify-end gap-3 text-sm text-content-secondary">
          <button type="button" aria-label="Previous page" disabled={!isPageChangeAllowed(previousPage ?? 0)} onClick={() => pagination.onPageChange(previousPage as number)} className="min-h-8 rounded border border-line px-3 text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50">
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pageCount}</span>
          <button type="button" aria-label="Next page" disabled={!isPageChangeAllowed(nextPage ?? 0)} onClick={() => pagination.onPageChange(nextPage as number)} className="min-h-8 rounded border border-line px-3 text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50">
            Next
          </button>
        </nav>
      ) : null}
    </section>
  );
};

export default DataTable;
