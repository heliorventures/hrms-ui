// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import EmployeeSearchSelect from './EmployeeSearchSelect';

afterEach(cleanup);

describe('EmployeeSearchSelect', () => {
  it('forwards loading availability without announcing a ready-empty employee set', () => {
    render(
      <EmployeeSearchSelect
        employees={[]}
        valueId=""
        onChangeId={() => undefined}
        availability="loading"
        stateMessage="Loading employee directory."
      />
    );

    expect(screen.getByRole('status').textContent).toBe('Loading employee directory.');
    expect(
      screen.getByRole<HTMLInputElement>('searchbox', { name: 'Search Employee' }).disabled
    ).toBe(true);
    expect(screen.getByRole<HTMLSelectElement>('listbox', { name: 'Employee' }).disabled).toBe(
      true
    );
    expect(screen.queryByText('No employees found.')).toBeNull();
  });
});
