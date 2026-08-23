// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import IconButton from './IconButton';

afterEach(cleanup);

describe('IconButton', () => {
  it('uses its required label as the accessible name and hides the icon', () => {
    render(
      <IconButton label="Delete employee" icon={<svg data-testid="icon" />} variant="danger" />
    );

    const button = screen.getByRole('button', { name: 'Delete employee' });
    expect(button.getAttribute('aria-label')).toBe('Delete employee');
    expect(button.className).toContain('min-h-11');
    expect(button.className).toContain('min-w-11');
    expect(screen.getByTestId('icon').parentElement?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps its typed label authoritative when conflicting native props reach runtime', () => {
    const conflictingNativeProps = { 'aria-label': 'Delete' };
    render(
      <IconButton
        {...conflictingNativeProps}
        label="Delete employee"
        icon={<svg data-testid="conflict-icon" />}
      />
    );

    const button = screen.getByRole('button', { name: 'Delete employee' });
    expect(button.getAttribute('aria-label')).toBe('Delete employee');
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
  });

  it('suppresses a stale runtime aria-labelledby name while preserving descriptions', () => {
    const conflictingNativeProps = {
      'aria-labelledby': 'stale-action-label',
      'aria-describedby': 'delete-action-hint',
    };
    render(
      <>
        <span id="stale-action-label">Archive employee</span>
        <span id="delete-action-hint">This action cannot be undone.</span>
        <IconButton
          {...conflictingNativeProps}
          label="Delete employee"
          icon={<svg data-testid="labelledby-conflict-icon" />}
        />
      </>
    );

    const button = screen.getByRole('button', { name: 'Delete employee' });
    expect(button.getAttribute('aria-labelledby')).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBe('delete-action-hint');
  });

  it('forwards its ref and preserves default type, native props, and disabled behavior', async () => {
    const user = userEventLibrary.setup();
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const view = render(
      <IconButton
        ref={ref}
        label="Open menu"
        icon={<svg />}
        data-menu-trigger="employee-actions"
        disabled
        onClick={onClick}
      />
    );

    const button = screen.getByRole<HTMLButtonElement>('button', { name: 'Open menu' });
    expect(ref.current).toBe(button);
    expect(button.type).toBe('button');
    expect(button.getAttribute('data-menu-trigger')).toBe('employee-actions');
    expect(button.disabled).toBe(true);
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();

    view.rerender(
      <IconButton
        ref={ref}
        label="Open menu"
        icon={<svg />}
        data-menu-trigger="employee-actions"
        onClick={onClick}
      />
    );
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
