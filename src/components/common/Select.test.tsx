// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Select, { type SelectProps } from './Select';

// @ts-expect-error Select controls require a visible or programmatic accessible name.
const unnamedSelect: SelectProps = {
  options: [{ value: 'manager', label: 'Manager' }],
};
void unnamedSelect;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Select', () => {
  it('merges descriptions and errors without replacing caller IDs and forwards native props', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <>
        <p id="role-help">Assigned by HR.</p>
        <Select
          ref={ref}
          id="role"
          label="Role"
          description="Controls application access."
          error="Choose a role."
          aria-describedby="role-help"
          name="roleId"
          required
          options={[
            { value: '', label: 'Choose a role' },
            { value: 'manager', label: 'Manager' },
          ]}
        />
      </>
    );

    const select = screen.getByLabelText<HTMLSelectElement>('Role');
    expect(ref.current).toBe(select);
    expect(select.name).toBe('roleId');
    expect(select.required).toBe(true);
    expect(select.getAttribute('aria-describedby')?.split(' ')).toEqual([
      'role-help',
      'role-description',
      'role-error',
    ]);
    expect(screen.getByRole('alert').id).toBe('role-error');
    expect(select.className).toContain('min-h-11');
    expect(select.className).toContain('text-base');
  });

  it('uses an explicit aria-labelledby when no visible label is provided', () => {
    render(
      <>
        <span id="assignment-label">Assignment</span>
        <Select
          aria-labelledby="assignment-label"
          options={[{ value: 'manager', label: 'Manager' }]}
        />
      </>
    );

    expect(screen.getByRole('combobox', { name: 'Assignment' })).toBeTruthy();
  });

  it('rejects blank visible and programmatic accessible names before rendering', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const options = [{ value: 'manager', label: 'Manager' }];

    expect(() => render(<Select label="" options={options} />)).toThrow(/non-blank accessible name/i);
    expect(() => render(<Select aria-label="   " options={options} />)).toThrow(
      /non-blank accessible name/i
    );
    expect(() => render(<Select aria-labelledby={' \t '} options={options} />)).toThrow(
      /non-blank accessible name/i
    );
  });
});
