// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Checkbox from './Checkbox';

afterEach(cleanup);

describe('Checkbox', () => {
  it('makes its label and description one mobile-safe native hit target', async () => {
    const user = userEventLibrary.setup();
    const onChange = vi.fn();
    render(
      <Checkbox
        label="Include inactive employees"
        description="Adds former employees to results."
        onChange={onChange}
      />
    );

    const checkbox = screen.getByLabelText<HTMLInputElement>('Include inactive employees');
    const label = screen.getByText('Include inactive employees').closest('label');
    expect(label?.contains(checkbox)).toBe(true);
    expect(label?.className).toContain('min-h-11');

    await user.click(screen.getByText('Include inactive employees'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(checkbox.checked).toBe(true);
  });

  it('preserves native props and caller events during keyboard activation', async () => {
    const user = userEventLibrary.setup();
    const onClick = vi.fn();
    const onChange = vi.fn();
    render(
      <Checkbox
        label="Accept policy"
        name="policyAccepted"
        value="yes"
        required
        data-policy-version="2026-08"
        onClick={onClick}
        onChange={onChange}
      />
    );

    const checkbox = screen.getByLabelText<HTMLInputElement>('Accept policy');
    expect(checkbox.type).toBe('checkbox');
    expect(checkbox.name).toBe('policyAccepted');
    expect(checkbox.value).toBe('yes');
    expect(checkbox.required).toBe(true);
    expect(checkbox.getAttribute('data-policy-version')).toBe('2026-08');
    checkbox.focus();
    await user.keyboard('[Space]');
    expect(onClick).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(checkbox.checked).toBe(true);
  });

  it('does not activate or invoke caller events when disabled', async () => {
    const user = userEventLibrary.setup();
    const onClick = vi.fn();
    const onChange = vi.fn();
    render(<Checkbox label="Locked setting" disabled onClick={onClick} onChange={onChange} />);

    const checkbox = screen.getByLabelText<HTMLInputElement>('Locked setting');
    await user.click(screen.getByText('Locked setting'));
    checkbox.focus();
    await user.keyboard('[Space]');
    expect(checkbox.checked).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
