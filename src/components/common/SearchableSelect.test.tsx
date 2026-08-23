// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SearchableSelect from './SearchableSelect';

type Employee = { id: string; name: string; code: string };

const employees: Employee[] = [
  { id: 'employee-1', name: 'Asha Rao', code: 'E001' },
  { id: 'employee-2', name: 'Vikram Shah', code: 'E002' },
];

const sharedProps = {
  label: 'Employee',
  getOptionId: (employee: Employee) => employee.id,
  getOptionLabel: (employee: Employee) => `${employee.code} — ${employee.name}`,
};

afterEach(cleanup);

describe('SearchableSelect', () => {
  it('links one visible label, search control, and native listbox and announces result counts', async () => {
    const user = userEventLibrary.setup();
    render(
      <SearchableSelect
        {...sharedProps}
        options={employees}
        value={null}
        onChange={() => undefined}
        placeholder="Choose an employee"
      />
    );

    const search = screen.getByRole('searchbox', { name: 'Search Employee' });
    const listbox = screen.getByRole('listbox', { name: 'Employee' });
    expect(document.querySelectorAll('label').length).toBe(1);
    expect(search.getAttribute('aria-controls')).toBe(listbox.id);
    expect(screen.getByRole('status').textContent).toBe('2 results available.');

    await user.type(search, 'Vikram');
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('1 result available.'));
    expect((listbox as HTMLSelectElement).options.length).toBe(2);
  });

  it('returns the selected option or null while treating the selected ID as authoritative', async () => {
    const user = userEventLibrary.setup();
    const onChange = vi.fn();
    const view = render(
      <SearchableSelect
        {...sharedProps}
        options={employees}
        value="employee-2"
        onChange={onChange}
        placeholder="Choose an employee"
      />
    );

    const listbox = screen.getByRole<HTMLSelectElement>('listbox', { name: 'Employee' });
    expect(listbox.value).toBe('employee-2');

    view.rerender(
      <SearchableSelect
        {...sharedProps}
        options={employees.map((employee) => ({ ...employee }))}
        value="employee-2"
        onChange={onChange}
        placeholder="Choose an employee"
      />
    );
    expect(listbox.value).toBe('employee-2');

    await user.selectOptions(listbox, 'employee-1');
    expect(onChange).toHaveBeenLastCalledWith(employees[0]);
    await user.selectOptions(listbox, '');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe('SearchableSelect availability', () => {
  it('distinguishes ready-empty, unavailable, loading, and ready no-match states', async () => {
    const user = userEventLibrary.setup();
    const view = render(
      <SearchableSelect
        {...sharedProps}
        options={[]}
        value={null}
        onChange={() => undefined}
        emptyMessage="No employees have been added."
      />
    );

    expect(screen.getByText('No employees have been added.')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('0 results available.');

    view.rerender(
      <SearchableSelect
        {...sharedProps}
        options={[]}
        value={null}
        onChange={() => undefined}
        availability="unavailable"
        stateMessage="Employee directory could not be loaded."
        emptyMessage="No employees have been added."
      />
    );
    expect(screen.getByRole('status').textContent).toBe('Employee directory could not be loaded.');
    expect(screen.queryByText('No employees have been added.')).toBeNull();
    expect(screen.getByRole<HTMLSelectElement>('listbox', { name: 'Employee' }).disabled).toBe(
      true
    );
    expect(
      screen.getByRole<HTMLInputElement>('searchbox', { name: 'Search Employee' }).disabled
    ).toBe(true);

    view.rerender(
      <SearchableSelect
        {...sharedProps}
        options={[]}
        value={null}
        onChange={() => undefined}
        availability="loading"
        stateMessage="Loading employees."
        emptyMessage="No employees have been added."
      />
    );
    expect(screen.getByRole('status').textContent).toBe('Loading employees.');
    expect(screen.queryByText('No employees have been added.')).toBeNull();

    view.rerender(
      <SearchableSelect
        {...sharedProps}
        options={employees}
        value={null}
        onChange={() => undefined}
        emptyMessage="No employees have been added."
      />
    );
    await user.type(screen.getByRole('searchbox', { name: 'Search Employee' }), 'Nobody');
    await waitFor(() => {
      expect(screen.getByText('No results match your search.').textContent).toBe(
        'No results match your search.'
      );
    });
  });

  it('keeps a filtered controlled selection explicit and consistent with search results', async () => {
    const user = userEventLibrary.setup();
    render(
      <SearchableSelect
        {...sharedProps}
        options={employees}
        value="employee-2"
        onChange={() => undefined}
      />
    );

    const search = screen.getByRole('searchbox', { name: 'Search Employee' });
    const listbox = screen.getByRole<HTMLSelectElement>('listbox', { name: 'Employee' });
    await user.type(search, 'Nobody');

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe(
        '0 search results. Current selection remains available.'
      );
    });
    expect(listbox.value).toBe('employee-2');
    expect(Array.from(listbox.options, (option) => option.value)).toEqual(['', 'employee-2']);
    expect(
      screen.getByText('No results match your search. Current selection remains selected.')
    ).toBeTruthy();
  });
});

describe('SearchableSelect selection and native semantics', () => {
  it('preserves a controlled ID when its option disappears and reports the unavailable selection', () => {
    const view = render(
      <SearchableSelect
        {...sharedProps}
        options={employees}
        value="employee-2"
        onChange={() => undefined}
      />
    );

    view.rerender(
      <SearchableSelect
        {...sharedProps}
        options={[employees[0]]}
        value="employee-2"
        onChange={() => undefined}
      />
    );

    const listbox = screen.getByRole<HTMLSelectElement>('listbox', { name: 'Employee' });
    expect(listbox.value).toBe('employee-2');
    expect(
      screen.getByRole<HTMLOptionElement>('option', {
        name: 'Selected option is unavailable.',
      }).disabled
    ).toBe(true);
    expect(screen.getByRole('status').textContent).toContain('Current selection is unavailable.');
  });

  it('preserves disabled and required semantics and exposes option descriptions', () => {
    render(
      <SearchableSelect
        {...sharedProps}
        getOptionDescription={(employee) =>
          employee.id === 'employee-1' ? 'Payroll administrator' : undefined
        }
        options={employees}
        value={null}
        onChange={() => undefined}
        disabled
        required
      />
    );

    const search = screen.getByRole<HTMLInputElement>('searchbox', { name: 'Search Employee' });
    const listbox = screen.getByRole<HTMLSelectElement>('listbox', { name: 'Employee' });
    expect(search.disabled).toBe(true);
    expect(listbox.disabled).toBe(true);
    expect(listbox.required).toBe(true);
    expect(screen.getByRole('option', { name: /Payroll administrator/ }).textContent).toContain(
      'Payroll administrator'
    );
  });
});
