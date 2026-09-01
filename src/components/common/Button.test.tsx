// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Button from './Button';

afterEach(cleanup);

describe('Button', () => {
  it('preserves legacy children as direct flex items with caller classes', () => {
    render(
      <Button className="legacy-action gap-4">
        <svg data-testid="legacy-icon" />
        <span>Approve request</span>
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Approve request' });
    expect(button.className).toContain('legacy-action');
    expect(button.className).toContain('gap-4');
    expect(button.children).toHaveLength(2);
    expect(button.children[0]).toBe(screen.getByTestId('legacy-icon'));
    expect(button.children[1].textContent).toBe('Approve request');
  });

  it('forwards its ref and preserves default type, native attributes, and handlers', () => {
    const ref = createRef<HTMLButtonElement>();
    const onPointerDown = vi.fn();

    render(
      <Button ref={ref} data-audit-id="save-action" onPointerDown={onPointerDown}>
        Save
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(ref.current).toBe(button);
    expect((button as HTMLButtonElement).type).toBe('button');
    expect(button.getAttribute('data-audit-id')).toBe('save-action');
    fireEvent.pointerDown(button);
    expect(onPointerDown).toHaveBeenCalledOnce();
  });

  it('keeps caller-disabled precedence and caller aria-busy semantics', () => {
    const onClick = vi.fn();
    const view = render(
      <Button disabled aria-busy="true" onClick={onClick}>
        Import
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Import' });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();

    view.rerender(
      <Button aria-busy="false" busy onClick={onClick}>
        Import
      </Button>
    );
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('retains its action label and blocks repeat activation while busy', () => {
    const onClick = vi.fn();

    const Harness = () => {
      const [busy, setBusy] = useState(false);
      return (
        <Button
          busy={busy}
          busyLabel="Saving"
          onClick={() => {
            onClick();
            setBusy(true);
          }}
        >
          Save changes
        </Button>
      );
    };

    render(<Harness />);
    const button = screen.getByRole('button', { name: /Save changes/i });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.textContent).toContain('Save changes');
    expect(button.textContent).toContain('Saving');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('announces default busy progress with a typographic ellipsis', () => {
    render(<Button busy>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save Working…' })).toBeTruthy();
  });

  it('renders decorative icon slots and a mobile-safe quiet action', () => {
    render(
      <Button
        variant="quiet"
        size="sm"
        startIcon={<svg data-testid="start-icon" />}
        endIcon={<svg data-testid="end-icon" />}
      >
        More actions
      </Button>
    );

    const button = screen.getByRole('button', { name: 'More actions' });
    expect(button.className).toContain('min-h-11');
    expect(button.className).toContain('focus-visible:');
    expect(screen.getByTestId('start-icon').parentElement?.getAttribute('aria-hidden')).toBe(
      'true'
    );
    expect(screen.getByTestId('end-icon').parentElement?.getAttribute('aria-hidden')).toBe('true');
  });
});
