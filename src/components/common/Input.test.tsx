// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Input, { type InputProps } from './Input';

// @ts-expect-error Input controls require a visible or programmatic accessible name.
const unnamedInput: InputProps = { placeholder: 'Enter a value' };
void unnamedInput;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Input', () => {
  it('merges caller, description, and error IDs while forwarding native attributes and its ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <>
        <p id="account-help">Use your work account.</p>
        <Input
          ref={ref}
          id="work-email"
          label="Work email"
          description="We will send notifications here."
          error="Enter a valid email."
          aria-describedby="account-help work-email-description"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
        />
      </>
    );

    const input = screen.getByLabelText<HTMLInputElement>('Work email');
    expect(ref.current).toBe(input);
    expect(input.name).toBe('email');
    expect(input.type).toBe('email');
    expect(input.inputMode).toBe('email');
    expect(input.autocomplete).toBe('email');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual([
      'account-help',
      'work-email-description',
      'work-email-error',
    ]);
    expect(screen.getByRole('alert').id).toBe('work-email-error');
  });

  it('uses mobile-safe text and target sizing with responsive compact density', () => {
    render(<Input label="Phone" />);
    const input = screen.getByLabelText('Phone');

    expect(input.className).toContain('min-h-11');
    expect(input.className).toContain('text-base');
    expect(input.className).toContain('md:text-sm');
  });

  it('uses an explicit aria-label when no visible label is provided', () => {
    render(<Input aria-label="Employee identifier" />);

    expect(screen.getByRole('textbox', { name: 'Employee identifier' })).toBeTruthy();
  });

  it('rejects blank visible and programmatic accessible names before rendering', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Input label="" />)).toThrow(/non-blank accessible name/i);
    expect(() => render(<Input aria-label="   " />)).toThrow(/non-blank accessible name/i);
    expect(() => render(<Input aria-labelledby={' \t '} />)).toThrow(/non-blank accessible name/i);
  });
});
