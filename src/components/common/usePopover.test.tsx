// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePopover } from './usePopover';

function PopoverHarness({ label = 'Actions', onClose = vi.fn() }) {
  const [open, setOpen] = useState(false);
  const popover = usePopover({
    open,
    onClose: () => {
      onClose();
      setOpen(false);
    },
  });

  return (
    <div>
      <button
        ref={popover.triggerRef}
        type="button"
        {...popover.triggerProps}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open ? (
        <div ref={popover.panelRef} role="region" tabIndex={-1} {...popover.panelProps}>
          <button type="button">First item</button>
          <button type="button">Second item</button>
          <button type="button" disabled>
            Disabled item
          </button>
        </div>
      ) : null}
    </div>
  );
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('usePopover', () => {
  it('links the trigger and panel, reports expanded state, and focuses the first item', async () => {
    render(<PopoverHarness />);

    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);

    const panel = screen.getByRole('region');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First item' })));
  });

  it('supports Arrow, Home, End, and Escape navigation with opener restoration', async () => {
    render(<PopoverHarness />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);

    const first = screen.getByRole('button', { name: 'First item' });
    const second = screen.getByRole('button', { name: 'Second item' });
    await waitFor(() => expect(document.activeElement).toBe(first));

    fireEvent.keyDown(first, { key: 'End' });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: 'Home' });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: 'Escape' });
    expect(screen.queryByRole('region')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('dismisses on an outside pointer and restores the opener', async () => {
    const onClose = vi.fn();
    render(
      <>
        <PopoverHarness onClose={onClose} />
        <div data-testid="outside">Outside</div>
      </>
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole('region')).toBeTruthy());

    fireEvent.pointerDown(screen.getByTestId('outside'));

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('region')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps only the most recently opened popover active', async () => {
    render(
      <>
        <PopoverHarness label="First actions" />
        <PopoverHarness label="Second actions" />
      </>
    );

    const first = screen.getByRole('button', { name: 'First actions' });
    const second = screen.getByRole('button', { name: 'Second actions' });
    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(second);

    await waitFor(() => expect(first.getAttribute('aria-expanded')).toBe('false'));
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('region')).toHaveLength(1);
  });
});
