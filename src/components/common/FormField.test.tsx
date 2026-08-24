// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import FormField from './FormField';

afterEach(cleanup);

describe('FormField', () => {
  it('creates stable label, description, and error relationships without duplicate IDs', () => {
    const view = render(
      <FormField
        label="Work email"
        description="Used for notifications."
        error="Enter a valid email."
        required
      >
        {({ inputId, describedBy, invalid }) => (
          <input id={inputId} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
    );

    const input = screen.getByLabelText('Work email');
    const firstId = input.id;
    const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? [];

    expect(firstId).not.toBe('');
    expect(describedBy).toEqual([`${firstId}-description`, `${firstId}-error`]);
    expect(new Set(describedBy).size).toBe(describedBy.length);
    expect(
      Array.from(document.querySelectorAll('[id]')).filter((node) => node.id === firstId).length
    ).toBe(1);
    expect(screen.getByRole('alert').id).toBe(`${firstId}-error`);

    view.rerender(
      <FormField
        label="Work email"
        description="Used for notifications."
        error="Enter a valid email."
        required
      >
        {({ inputId, describedBy: nextDescribedBy, invalid }) => (
          <input id={inputId} aria-describedby={nextDescribedBy} aria-invalid={invalid} />
        )}
      </FormField>
    );
    expect(screen.getByLabelText('Work email').id).toBe(firstId);
  });

  it('shows an optional hint only when the field is not required', () => {
    render(
      <FormField label="Middle name" optionalLabel="Optional">
        {({ inputId }) => <input id={inputId} />}
      </FormField>
    );

    expect(screen.getByText('Optional').textContent).toBe('Optional');
  });

  it('shows a centralized required marker that does not become part of the accessible label', () => {
    render(
      <FormField label="Employee Code" required>
        {({ inputId }) => <input id={inputId} />}
      </FormField>
    );

    expect(screen.getByLabelText('Employee Code')).toBeTruthy();
    const marker = screen.getByText('*');
    expect(marker.getAttribute('aria-hidden')).toBe('true');
  });
});
