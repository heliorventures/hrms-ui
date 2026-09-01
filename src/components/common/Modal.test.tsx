// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Modal from './Modal';

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
  document.body.style.overflow = '';
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  document.body.style.overflow = '';
});

const renderInApplicationRoot = (node: React.ReactNode) => {
  const root = document.getElementById('root');
  if (!root) throw new Error('Application root is unavailable');
  return render(node, { container: root });
};

describe('Modal', () => {
  it('portals an accessible dialog, inerts the application, and restores document state', () => {
    const view = renderInApplicationRoot(
      <Modal isOpen onClose={() => undefined} title="Employee details" description="Review the record.">
        <button type="button">Save</button>
      </Modal>
    );

    const root = document.getElementById('root');
    const dialog = screen.getByRole('dialog', { name: 'Employee details' });
    expect(dialog.closest('#root')).toBeNull();
    expect(dialog.closest('[aria-hidden="true"]')).toBeNull();
    expect(root?.hasAttribute('inert')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(dialog.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
      'Review the record.'
    );

    view.unmount();
    expect(root?.hasAttribute('inert')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('uses a viewport-safe scroll surface and sticky action footer', () => {
    renderInApplicationRoot(
      <Modal
        isOpen
        onClose={() => undefined}
        title="Policy"
        footer={<button type="button">Save policy</button>}
      >
        Content
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: 'Policy' });
    const scrollRegion = dialog.querySelector('section');
    const footer = dialog.querySelector('footer');
    const portalLayer = dialog.parentElement?.parentElement;
    expect(dialog.className).toContain('100dvh');
    expect(dialog.className).toContain('overscroll-contain');
    expect(scrollRegion?.className).toContain('overscroll-contain');
    expect(scrollRegion?.className).toContain('safe-area-inset-left');
    expect(scrollRegion?.className).toContain('safe-area-inset-right');
    expect(footer?.className).toContain('sticky');
    expect(footer?.className).toContain('safe-area-inset-bottom');
    expect(footer?.className).toContain('safe-area-inset-left');
    expect(footer?.className).toContain('safe-area-inset-right');
    expect(portalLayer?.className).toContain('safe-area-inset-left');
    expect(portalLayer?.className).toContain('safe-area-inset-right');
    expect(portalLayer?.className).not.toContain('sm:p-4');

    const close = screen.getByRole('button', { name: /close modal/i });
    expect(close.className).toContain('min-h-11');
    expect(close.className).toContain('min-w-11');
  });

  it('uses rendered native tab order and rejects CSS-hidden, unrendered, and unchecked-radio targets', () => {
    const visibleRect = {
      bottom: 1,
      height: 1,
      left: 0,
      right: 1,
      top: 0,
      width: 1,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
    const visibleRects = [visibleRect] as unknown as DOMRectList;
    const noRects = [] as unknown as DOMRectList;
    vi.spyOn(document.documentElement, 'getClientRects').mockReturnValue(visibleRects);
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(visibleRects);
    const hiddenInitialRef = createRef<HTMLButtonElement>();

    renderInApplicationRoot(
      <Modal
        isOpen
        onClose={() => undefined}
        title="Native tab order"
        initialFocusRef={hiddenInitialRef}
      >
        <div style={{ display: 'none' }}>
          <button ref={hiddenInitialRef} type="button" tabIndex={1}>
            Hidden by ancestor
          </button>
        </div>
        <button
          type="button"
          tabIndex={1}
          ref={(element) => {
            if (element) element.getClientRects = () => noRects;
          }}
        >
          No rendered box
        </button>
        <button type="button" tabIndex={1}>First positive target</button>
        <button type="button" tabIndex={2}>Second positive target</button>
        <label>
          <input type="radio" name="choice" defaultChecked /> Checked choice
        </label>
        <label>
          <input type="radio" name="choice" /> Unchecked choice
        </label>
      </Modal>
    );

    const first = screen.getByRole('button', { name: 'First positive target' });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Checked choice' }));
  });

  it('excludes an editable element with explicit tabIndex -1 from sequential focus', () => {
    const editorRef = createRef<HTMLDivElement>();
    renderInApplicationRoot(
      <Modal
        isOpen
        onClose={() => undefined}
        title="Programmatic editor focus"
        initialFocusRef={editorRef}
      >
        <button type="button">Sequential action</button>
        <div ref={editorRef} contentEditable tabIndex={-1} suppressContentEditableWarning>
          Programmatic editor
        </div>
      </Modal>
    );

    const close = screen.getByRole('button', { name: /close modal/i });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sequential action' }));
  });

  it('honors initial focus and traps forward and backward focus on actual tabbables', async () => {
    const user = userEventLibrary.setup();
    const initialFocusRef = createRef<HTMLButtonElement>();

    renderInApplicationRoot(
      <Modal
        isOpen
        onClose={() => undefined}
        title="Focus contract"
        initialFocusRef={initialFocusRef}
      >
        <input type="hidden" />
        <button type="button" ref={initialFocusRef}>
          First action
        </button>
        <div contentEditable suppressContentEditableWarning>
          Editable notes
        </div>
      </Modal>
    );

    const first = screen.getByRole('button', { name: 'First action' });
    const close = screen.getByRole('button', { name: /close modal/i });
    const editable = screen.getByText('Editable notes');
    expect(document.activeElement).toBe(first);

    await user.tab();
    expect(document.activeElement).toBe(editable);
    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(editable);
  });

  it('keeps nested stack order stable across parent option rerenders and restores the nested opener', async () => {
    const user = userEventLibrary.setup();
    const innerClosed = vi.fn();

    const Harness = ({ dismissParent }: { dismissParent: boolean }) => {
      const [innerOpen, setInnerOpen] = useState(false);
      return (
        <Modal
          isOpen
          isDismissible={dismissParent}
          onClose={() => undefined}
          title="Parent dialog"
        >
          <button type="button">Parent first action</button>
          <button type="button" onClick={() => setInnerOpen(true)}>
            Open nested dialog
          </button>
          <Modal
            isOpen={innerOpen}
            onClose={() => {
              innerClosed();
              setInnerOpen(false);
            }}
            title="Nested dialog"
          >
            <button type="button">Nested action</button>
          </Modal>
        </Modal>
      );
    };

    const view = renderInApplicationRoot(<Harness dismissParent />);
    const opener = screen.getByRole('button', { name: 'Open nested dialog' });
    await user.click(opener);
    const nestedDialog = screen.getByRole('dialog', { name: 'Nested dialog' });
    const parentDialog = screen.getByText('Parent dialog').closest('[role="dialog"]');
    if (!(parentDialog instanceof HTMLElement)) throw new Error('Parent dialog was not rendered');
    expect(nestedDialog.hasAttribute('inert')).toBe(false);
    expect(nestedDialog.getAttribute('aria-hidden')).toBeNull();
    expect(parentDialog.hasAttribute('inert')).toBe(true);
    expect(parentDialog.getAttribute('aria-hidden')).toBe('true');

    view.rerender(<Harness dismissParent={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(innerClosed).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog', { name: 'Nested dialog' })).toBeNull();
    expect(parentDialog.hasAttribute('inert')).toBe(false);
    expect(parentDialog.getAttribute('aria-hidden')).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Parent dialog' })).toBeTruthy();
    await Promise.resolve();
    expect(document.activeElement).toBe(opener);
  });

  it('does not dismiss a lower dialog when the topmost dialog is locked', () => {
    const parentClose = vi.fn();
    const childClose = vi.fn();
    const Harness = () => {
      const [childOpen, setChildOpen] = useState(false);
      return (
        <Modal isOpen onClose={parentClose} title="Parent">
          <button type="button" onClick={() => setChildOpen(true)}>
            Open locked child
          </button>
          <Modal
            isOpen={childOpen}
            isDismissible={false}
            onClose={childClose}
            title="Locked child"
          >
            Locked
          </Modal>
        </Modal>
      );
    };
    renderInApplicationRoot(
      <Harness />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open locked child' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(parentClose).not.toHaveBeenCalled();
    expect(childClose).not.toHaveBeenCalled();
  });

  it('restores focus to the original opener after closing', async () => {
    const user = userEventLibrary.setup();
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Edit employee
          </button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit employee">
            <button type="button">Save employee</button>
          </Modal>
        </>
      );
    };
    renderInApplicationRoot(<Harness />);

    const opener = screen.getByRole('button', { name: 'Edit employee' });
    await user.click(opener);
    await user.click(screen.getByRole('button', { name: /close modal/i }));
    expect(document.activeElement).toBe(opener);
  });
});
