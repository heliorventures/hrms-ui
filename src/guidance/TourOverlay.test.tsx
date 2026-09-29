// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { TourOverlay } from './TourOverlay';
import type { TourDefinition } from './tourTypes';

const tour: TourDefinition = {
  id: 'leave-page',
  routePaths: ['leave'],
  steps: [
    {
      id: 'request',
      anchor: 'leave-request',
      title: 'Request leave',
      body: 'Review your balance.',
    },
    { id: 'history', anchor: null, title: 'Leave history', body: 'Review recent requests.' },
  ],
};

const visibleRect = {
  bottom: 120,
  height: 40,
  left: 80,
  right: 240,
  top: 80,
  width: 160,
  x: 80,
  y: 80,
  toJSON: () => ({}),
} as DOMRect;
const visibleRects = [visibleRect] as unknown as DOMRectList;

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
  document.body.style.overflow = '';
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.spyOn(document.documentElement, 'getClientRects').mockReturnValue(visibleRects);
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(visibleRects);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(visibleRect);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  document.body.style.overflow = '';
});

function renderOverlay(
  definition: TourDefinition = tour,
  onClose = vi.fn(),
  returnFocusRef = createRef<HTMLElement>()
) {
  const root = document.getElementById('root');
  if (!root) throw new Error('Application root is unavailable');
  return {
    ...render(<TourOverlay tour={definition} onClose={onClose} returnFocusRef={returnFocusRef} />, {
      container: root,
    }),
    onClose,
    returnFocusRef,
  };
}

it('supports Back, Next, Skip step, Finish, and Close navigation', async () => {
  const user = userEventLibrary.setup();
  const { onClose } = renderOverlay();

  expect(screen.getByRole('dialog', { name: 'Request leave' })).toBeTruthy();
  expect(
    within(screen.getByRole('dialog'))
      .getByRole('button', { name: 'Back' })
      .hasAttribute('disabled')
  ).toBe(true);

  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('dialog', { name: 'Leave history' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('dialog', { name: 'Request leave' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Skip step' }));
  expect(screen.getByRole('dialog', { name: 'Leave history' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Finish tour' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('keeps a missing anchor step usable and discovers an anchor that renders later', async () => {
  const definition: TourDefinition = {
    id: 'late-anchor',
    routePaths: ['leave'],
    steps: [
      {
        id: 'late',
        anchor: 'late-control',
        title: 'Late control',
        body: 'What this control does.',
      },
    ],
  };
  renderOverlay(definition);

  expect(screen.getByRole('status').textContent).toContain("isn't available right now");
  expect(screen.getByRole('button', { name: 'Finish tour' }).hasAttribute('disabled')).toBe(false);

  const lateControl = document.createElement('button');
  lateControl.type = 'button';
  lateControl.setAttribute('data-tour-anchor', 'late-control');
  document.getElementById('root')?.append(lateControl);

  await waitFor(() => expect(screen.getByTestId('tour-spotlight')).toBeTruthy());
  expect(screen.queryByRole('status')).toBeNull();
});

it('refreshes anchor visibility when an ancestor aria-hidden value changes', async () => {
  const root = document.getElementById('root');
  if (!root) throw new Error('Application root is unavailable');
  const section = document.createElement('section');
  section.setAttribute('aria-hidden', 'true');
  const action = document.createElement('button');
  action.type = 'button';
  action.setAttribute('data-tour-anchor', 'leave-request');
  section.append(action);
  root.append(section);
  const definition: TourDefinition = {
    id: 'aria-hidden-anchor',
    routePaths: ['leave'],
    steps: [
      {
        id: 'request',
        anchor: 'leave-request',
        title: 'Request leave',
        body: 'Review your balance.',
      },
    ],
  };
  renderOverlay(definition);

  expect(screen.getByRole('status').textContent).toContain("isn't available right now");
  section.removeAttribute('aria-hidden');
  await waitFor(() => expect(screen.getByTestId('tour-spotlight')).toBeTruthy());

  section.setAttribute('aria-hidden', 'true');
  await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
  expect(screen.queryByTestId('tour-spotlight')).toBeNull();
});

it('updates spotlight and dialog positions when the target moves during scrolling', async () => {
  let targetRect = visibleRect;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement
  ) {
    return this.getAttribute('data-tour-anchor') === 'leave-request' ? targetRect : visibleRect;
  });
  const root = document.getElementById('root');
  if (!root) throw new Error('Application root is unavailable');
  const action = document.createElement('button');
  action.type = 'button';
  action.setAttribute('data-tour-anchor', 'leave-request');
  root.append(action);
  renderOverlay();

  const dialog = screen.getByTestId('tour-dialog');
  await waitFor(() => expect(dialog.style.left).toBe('80px'));
  targetRect = {
    ...visibleRect,
    bottom: 360,
    left: 600,
    right: 760,
    top: 320,
    x: 600,
    y: 320,
  } as DOMRect;
  fireEvent.scroll(window);

  await waitFor(() => expect(dialog.style.left).toBe('600px'));
  expect(screen.getByTestId('tour-spotlight').getAttribute('style')).toContain('left: 592px');
});

it('closes on Escape, restores trigger focus, and restores pre-existing inert state', async () => {
  const root = document.getElementById('root');
  if (!root) throw new Error('Application root is unavailable');
  root.setAttribute('inert', '');
  root.setAttribute('aria-hidden', 'false');
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.textContent = 'Open tour';
  document.body.append(trigger);
  trigger.focus();
  const returnFocusRef = { current: trigger };
  const ControlledTour = () => {
    const [open, setOpen] = useState(true);
    return open ? (
      <TourOverlay tour={tour} onClose={() => setOpen(false)} returnFocusRef={returnFocusRef} />
    ) : null;
  };
  const view = render(<ControlledTour />, { container: root });

  expect(screen.getByRole('button', { name: 'Close tour' })).toBe(document.activeElement);
  fireEvent.keyDown(document.activeElement ?? screen.getByTestId('tour-dialog'), {
    key: 'Escape',
  });

  await waitFor(() => expect(screen.queryByTestId('tour-dialog')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(root.hasAttribute('inert')).toBe(true);
  expect(root.getAttribute('aria-hidden')).toBe('false');
  view.unmount();
});

it('places the dialog within a narrow viewport and honors reduced motion', () => {
  vi.stubGlobal('innerWidth', 390);
  vi.stubGlobal('innerHeight', 720);
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
  renderOverlay();

  const dialog = screen.getByTestId('tour-dialog');
  expect(dialog.style.left).toBe('16px');
  expect(dialog.style.bottom).toContain('safe-area-inset-bottom');
  expect(dialog.style.maxHeight).toContain('100dvh');
  expect(dialog.className).toContain('overflow-hidden');
});

it('intercepts pointer and keyboard use without invoking a highlighted business action', async () => {
  const user = userEventLibrary.setup();
  const businessMutation = vi.fn();
  const root = document.getElementById('root');
  if (!root) throw new Error('Application root is unavailable');
  const action = document.createElement('button');
  action.type = 'button';
  action.textContent = 'Submit request';
  action.setAttribute('data-tour-anchor', 'leave-request');
  action.addEventListener('click', businessMutation);
  action.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') businessMutation();
  });
  root.append(action);
  renderOverlay();

  expect(root.hasAttribute('inert')).toBe(true);
  expect(root.hasAttribute('aria-hidden')).toBe(false);
  const spotlight = screen.getByTestId('tour-spotlight');
  fireEvent.pointerDown(spotlight);
  fireEvent.click(spotlight);
  await user.keyboard('{Enter}');

  expect(businessMutation).not.toHaveBeenCalled();
  expect(document.activeElement).not.toBe(action);
});
