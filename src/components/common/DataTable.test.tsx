// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DataTable, { type DataTableColumn } from './DataTable';

interface Employee {
  id: string;
  name: string;
  salary: number;
  secret: string;
}

const employees: Employee[] = [
  { id: 'ada', name: 'Ada Lovelace', salary: 120000, secret: 'private-ada' },
  { id: 'grace', name: 'Grace Hopper', salary: 110000, secret: 'private-grace' },
];

const columns: DataTableColumn<Employee>[] = [
  { id: 'name', header: 'Employee', cell: (row) => row.name, sortable: true, mobilePriority: 'primary' },
  { id: 'salary', header: 'Salary', cell: (row) => row.salary, sortable: true, numeric: true, mobilePriority: 'secondary' },
  { id: 'secret', header: 'Secret', cell: (row) => row.secret, mobilePriority: 'hidden' },
  { id: 'actions', header: '', cell: (row) => <button type="button">Review {row.name}</button> },
];

const renderTable = (overrides: Partial<React.ComponentProps<typeof DataTable<Employee>>> = {}) =>
  render(
    <DataTable
      ariaLabel="Employee records"
      rows={employees}
      columns={columns}
      getRowId={(row) => row.id}
      {...overrides}
    />
  );

const expectText = (element: Element, text: string) => expect(element.textContent).toContain(text);
const expectClasses = (element: Element, ...classNames: string[]) =>
  classNames.forEach((className) => expect(element.classList.contains(className)).toBe(true));

afterEach(cleanup);

describe('DataTable', () => {
  it('provides a named native table with scoped and accessible headers', () => {
    renderTable();

    const table = screen.getByRole('table', { name: 'Employee records' });
    expectClasses(within(table).getByText('Employee records'), 'sr-only');
    expect(within(table).getByRole('columnheader', { name: 'Employee' }).getAttribute('scope')).toBe('col');
    expect(within(table).getByRole('columnheader', { name: 'Actions' }).getAttribute('scope')).toBe('col');
  });

  it('delegates sorting and reports only the caller-controlled active sort without reordering rows', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderTable({ sort: { columnId: 'salary', direction: 'descending', onChange } });

    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'Salary' }).getAttribute('aria-sort')).toBe('descending');
    expectText(within(table).getAllByRole('row')[1], 'Ada Lovelace');
    const sortByEmployee = screen.getByRole('button', { name: 'Sort by Employee' });
    sortByEmployee.focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('name');
    expect(screen.queryByRole('button', { name: 'Sort by Secret' })).toBeNull();

    renderTable({ sort: { columnId: 'unknown', direction: 'ascending', onChange } });
    expect(screen.getAllByRole('columnheader', { name: 'Employee' })[0].getAttribute('aria-sort')).toBeNull();
  });

  it('does not expose aria-sort when the controlled column is not sortable', () => {
    renderTable({ sort: { columnId: 'secret', direction: 'ascending', onChange: vi.fn() } });

    const secretHeader = within(screen.getByRole('table')).getByRole('columnheader', { name: 'Secret' });
    expect(secretHeader.getAttribute('aria-sort')).toBeNull();
    expect(within(secretHeader).queryByRole('button')).toBeNull();
  });

  it('keeps selection fully controlled and labels row controls without exposing opaque ids', () => {
    const onSelectionChange = vi.fn();
    const selectedRowIds = new Set(['ada', 'outside-the-rendered-page']);
    renderTable({ selectedRowIds, onSelectionChange, getRowLabel: (row) => row.name });

    const table = screen.getByRole('table');
    const ada = within(table).getByRole('checkbox', { name: 'Select Ada Lovelace' });
    const grace = within(table).getByRole('checkbox', { name: 'Select Grace Hopper' });
    expect((ada as HTMLInputElement).checked).toBe(true);
    expect((grace as HTMLInputElement).checked).toBe(false);
    fireEvent.click(grace);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['ada', 'grace', 'outside-the-rendered-page']));
    expect(selectedRowIds).toEqual(new Set(['ada', 'outside-the-rendered-page']));
    fireEvent.click(within(table).getByRole('checkbox', { name: 'Select all visible rows' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['ada', 'grace', 'outside-the-rendered-page']));
  });

  it('does not render selection controls unless both controlled selection props are present', () => {
    renderTable({ selectedRowIds: new Set() });
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it.each(['loading', 'error', 'empty'] as const)(
    'removes selection controls while the %s state suppresses rows',
    (state) => {
      renderTable({ state, selectedRowIds: new Set(['ada']), onSelectionChange: vi.fn() });

      expect(screen.queryByRole('checkbox')).toBeNull();
    }
  );

  it('retains controlled row selection when a custom mobile row is supplied', () => {
    const onSelectionChange = vi.fn();
    renderTable({
      selectedRowIds: new Set(['ada']),
      onSelectionChange,
      getRowLabel: (row) => row.name,
      renderMobileRow: (row) => <span>Compact {row.name}</span>,
    });

    const mobileList = screen.getByRole('list', { name: 'Employee records mobile view' });
    const grace = within(mobileList).getByRole('checkbox', { name: 'Select Grace Hopper' });
    fireEvent.click(grace);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['ada', 'grace']));
  });

  it('delegates bounded pagination without slicing or rewriting inconsistent caller state', () => {
    const onPageChange = vi.fn();
    const { rerender } = renderTable({ pagination: { page: 2, pageCount: 3, onPageChange } });

    expect(screen.getByText('Page 2 of 3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    expectText(screen.getByRole('table'), 'Ada Lovelace');

    rerender(
      <DataTable
        ariaLabel="Employee records"
        rows={employees}
        columns={columns}
        getRowId={(row) => row.id}
        pagination={{ page: 4, pageCount: 2, onPageChange }}
      />
    );
    expect(screen.getByText('Page 4 of 2')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('keeps controlled pagination available on a ready page with no rows', () => {
    const onPageChange = vi.fn();
    renderTable({
      rows: [],
      state: 'ready',
      pagination: { page: 2, pageCount: 3, onPageChange },
    });

    expect(screen.getByText('Page 2 of 3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it('suppresses rows for loading, error, and empty states while partial retains data and recovery', () => {
    const { rerender } = renderTable({ state: 'loading', stateMessage: 'Loading employees' });
    expectText(screen.getByRole('status'), 'Loading employees');
    expect(screen.queryByText('Ada Lovelace')).toBeNull();

    rerender(<DataTable ariaLabel="Employee records" rows={employees} columns={columns} getRowId={(row) => row.id} state="error" stateMessage="Could not load" />);
    expectText(screen.getByRole('alert'), 'Could not load');
    expect(screen.queryByText('Ada Lovelace')).toBeNull();

    rerender(<DataTable ariaLabel="Employee records" rows={[]} columns={columns} getRowId={(row) => row.id} state="empty" stateMessage="No employees" />);
    expect(screen.getByText('No employees')).toBeTruthy();

    rerender(<DataTable ariaLabel="Employee records" rows={employees} columns={columns} getRowId={(row) => row.id} state="partial" stateMessage="Some results are unavailable" recoveryAction={<button type="button">Try again</button>} />);
    expectText(screen.getByRole('status'), 'Some results are unavailable');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
    expect(within(screen.getByRole('table')).getByText('Ada Lovelace')).toBeTruthy();
  });

  it('uses the honest empty state for ready data with no rows', () => {
    renderTable({ rows: [], state: 'ready' });
    expect(screen.getByText('No records to display.')).toBeTruthy();
  });

  it('uses semantic tokens and numeric alignment classes', () => {
    renderTable();
    const table = screen.getByRole('table');
    expectClasses(table, 'bg-surface', 'text-content-primary');
    expectClasses(within(table).getByRole('columnheader', { name: 'Salary' }), 'tabular-nums', 'text-right');
    expectClasses(within(table).getByText('120000'), 'tabular-nums', 'text-right');
  });

  it('uses custom mobile rows or a priority-based fallback that omits hidden values and preserves actions', () => {
    const { rerender } = renderTable();
    const mobileList = screen.getByRole('list', { name: 'Employee records mobile view' });
    expectText(mobileList, 'Employee');
    expectText(mobileList, 'Salary');
    expect(mobileList.textContent).not.toContain('private-ada');
    expect(within(mobileList).getByRole('button', { name: 'Review Ada Lovelace' })).toBeTruthy();
    expectClasses(screen.getByRole('table').parentElement as Element, 'hidden', 'md:block');
    expectClasses(mobileList, 'md:hidden');

    rerender(
      <DataTable
        ariaLabel="Employee records"
        rows={employees}
        columns={columns}
        getRowId={(row) => row.id}
        renderMobileRow={(row) => <span>Compact {row.name}</span>}
      />
    );
    expectText(screen.getByRole('list'), 'Compact Ada Lovelace');
    expect(screen.getByRole('list').textContent).not.toContain('Salary');
  });
});
