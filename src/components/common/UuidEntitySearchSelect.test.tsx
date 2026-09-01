// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import UuidEntitySearchSelect from './UuidEntitySearchSelect';

afterEach(cleanup);

describe('UuidEntitySearchSelect', () => {
  it('forwards unavailable state without announcing a ready-empty option set', () => {
    render(
      <UuidEntitySearchSelect
        label="Department"
        options={[]}
        valueId=""
        onChangeId={() => undefined}
        availability="unavailable"
        stateMessage="Department directory is unavailable."
      />
    );

    expect(screen.getByRole('status').textContent).toBe('Department directory is unavailable.');
    expect(
      screen.getByRole<HTMLInputElement>('searchbox', { name: 'Search Department' }).disabled
    ).toBe(true);
    expect(screen.getByRole<HTMLSelectElement>('listbox', { name: 'Department' }).disabled).toBe(
      true
    );
    expect(screen.queryByText('No options are available.')).toBeNull();
  });
});
