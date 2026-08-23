// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Switch from './Switch';

afterEach(cleanup);

describe('Switch', () => {
  it('exposes its checked state and toggles through a native button', async () => {
    const user = userEventLibrary.setup();
    const onChange = vi.fn();
    render(
      <Switch
        label="Email notifications"
        description="Receive important account updates."
        checked={false}
        onChange={onChange}
      />
    );

    const control = screen.getByRole('switch', { name: 'Email notifications' });
    expect(control.tagName).toBe('BUTTON');
    expect(control.getAttribute('aria-checked')).toBe('false');
    expect(control.className).toContain('min-h-11');

    await user.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('composes caller clicks, respects preventDefault, and supports native keyboard activation', async () => {
    const user = userEventLibrary.setup();
    const onChange = vi.fn();
    const preventingClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    });
    const view = render(
      <Switch
        label="Payroll alerts"
        checked={false}
        onChange={onChange}
        onClick={preventingClick}
        data-alert-channel="payroll"
      />
    );

    const control = screen.getByRole<HTMLButtonElement>('switch', { name: 'Payroll alerts' });
    expect(control.type).toBe('button');
    expect(control.getAttribute('data-alert-channel')).toBe('payroll');
    await user.click(control);
    expect(preventingClick).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();

    const onClick = vi.fn();
    view.rerender(
      <Switch
        label="Payroll alerts"
        checked={false}
        onChange={onChange}
        onClick={onClick}
        data-alert-channel="payroll"
      />
    );
    control.focus();
    await user.keyboard('[Space]');
    expect(onClick).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not activate when disabled', async () => {
    const user = userEventLibrary.setup();
    const onClick = vi.fn();
    const onChange = vi.fn();
    render(
      <Switch
        label="Locked alerts"
        checked={false}
        disabled
        onClick={onClick}
        onChange={onChange}
      />
    );

    const control = screen.getByRole<HTMLButtonElement>('switch', { name: 'Locked alerts' });
    await user.click(control);
    control.focus();
    await user.keyboard('[Space]');
    expect(onClick).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('suppresses track and thumb transitions for reduced motion', () => {
    render(<Switch label="Motion-safe switch" checked={false} onChange={() => undefined} />);

    const control = screen.getByRole('switch', { name: 'Motion-safe switch' });
    const track = control.firstElementChild;
    const thumb = track?.firstElementChild;
    expect(track?.className).toContain('motion-reduce:transition-none');
    expect(thumb?.className).toContain('motion-reduce:transition-none');
  });
});
