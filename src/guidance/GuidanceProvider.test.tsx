// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GuidanceProvider } from './GuidanceProvider';
import type { TourDefinition } from './tourTypes';
import { useGuidance } from './useGuidance';

const pageTour: TourDefinition = {
  id: 'leave-page',
  routePaths: ['leave'],
  steps: [{ id: 'intro', anchor: null, title: 'Leave page', body: 'Understand your leave.' }],
};
const overviewTour: TourDefinition = {
  id: 'application-overview',
  routePaths: [],
  steps: [{ id: 'welcome', anchor: null, title: 'Welcome', body: 'Find your work.' }],
};

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

const HelpControls = () => {
  const guidance = useGuidance();
  return (
    <div>
      <button type="button" onClick={guidance.startPageTour} disabled={!guidance.hasPageTour}>
        Start page tour
      </button>
      <button type="button" onClick={() => guidance.startOverview()}>
        Replay overview
      </button>
      <button
        type="button"
        onClick={() => guidance.startOverview({ persistDismissalOnClose: true })}
      >
        Start automatic overview
      </button>
      <button
        type="button"
        onClick={() => {
          guidance.closeTour();
          guidance.closeTour();
        }}
      >
        Close twice
      </button>
      <output>{guidance.isTourActive ? 'active' : 'closed'}</output>
    </div>
  );
};

function renderProvider(
  props: {
    matchedRoutePath?: string | null;
    identityKey?: string | null;
    authorizationKey?: string | null;
    onOverviewDismiss?: () => void | Promise<void>;
    onOverviewDismissError?: (error: unknown) => void;
  } = {}
) {
  const root = document.getElementById('root');
  if (!root) throw new Error('Application root is unavailable');
  return render(
    <GuidanceProvider
      matchedRoutePath={props.matchedRoutePath === undefined ? 'leave' : props.matchedRoutePath}
      identityKey={props.identityKey ?? 'tenant-a:user-a'}
      authorizationKey={props.authorizationKey}
      overviewTour={overviewTour}
      registeredTours={[pageTour]}
      onOverviewDismiss={props.onOverviewDismiss}
      onOverviewDismissError={props.onOverviewDismissError}
    >
      <HelpControls />
    </GuidanceProvider>,
    { container: root }
  );
}

describe('GuidanceProvider', () => {
  it('finds a tour from the matched route and exposes active Help state', async () => {
    const view = renderProvider({ matchedRoutePath: 'leave' });

    const startButton = screen.getByRole('button', { name: 'Start page tour' });
    expect(startButton.hasAttribute('disabled')).toBe(false);
    fireEvent.click(startButton);
    expect(screen.getByRole('dialog', { name: 'Leave page' })).toBeTruthy();

    view.rerender(
      <GuidanceProvider
        matchedRoutePath="leave?tab=history"
        identityKey="tenant-a:user-a"
        overviewTour={overviewTour}
        registeredTours={[pageTour]}
      >
        <HelpControls />
      </GuidanceProvider>
    );
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Leave page' })).toBeNull());
    expect(screen.getByRole('button', { name: 'Start page tour' }).hasAttribute('disabled')).toBe(
      true
    );
  });

  it('passes source permission checks into registered tour visibility rules', () => {
    const capabilityTour: TourDefinition = {
      id: 'capability-page',
      routePaths: ['leave'],
      steps: [
        {
          id: 'submit',
          anchor: null,
          title: 'Submit a request',
          body: 'This step is visible to users who can submit leave.',
          isVisible: ({ canCapability }) => canCapability?.('action.leave.submit') ?? false,
        },
      ],
    };
    render(
      <GuidanceProvider
        matchedRoutePath="leave"
        tourContext={{ canCapability: (capability) => capability === 'action.leave.submit' }}
        registeredTours={[capabilityTour]}
      >
        <HelpControls />
      </GuidanceProvider>
    );

    expect(screen.getByRole('button', { name: 'Start page tour' }).hasAttribute('disabled')).toBe(
      false
    );
  });

  it('invalidates an open tour when the authenticated identity changes', async () => {
    const onOverviewDismiss = vi.fn();
    const view = renderProvider({ onOverviewDismiss });
    fireEvent.click(screen.getByRole('button', { name: 'Start automatic overview' }));
    expect(screen.getByRole('dialog', { name: 'Welcome' })).toBeTruthy();

    view.rerender(
      <GuidanceProvider
        matchedRoutePath="leave"
        identityKey="tenant-b:user-a"
        overviewTour={overviewTour}
        registeredTours={[pageTour]}
        onOverviewDismiss={onOverviewDismiss}
      >
        <HelpControls />
      </GuidanceProvider>
    );

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Welcome' })).toBeNull());
    expect(onOverviewDismiss).not.toHaveBeenCalled();
  });

  it('writes dismissal once when an automatic overview closes', async () => {
    const onOverviewDismiss = vi.fn();
    renderProvider({ onOverviewDismiss });

    fireEvent.click(screen.getByRole('button', { name: 'Start automatic overview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close tour' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Welcome' })).toBeNull());
    expect(onOverviewDismiss).toHaveBeenCalledOnce();
  });

  it('does not write dismissal when the overview is replayed from Help', async () => {
    const onOverviewDismiss = vi.fn();
    renderProvider({ onOverviewDismiss });

    fireEvent.click(screen.getByRole('button', { name: 'Replay overview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close tour' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Welcome' })).toBeNull());
    expect(onOverviewDismiss).not.toHaveBeenCalled();
  });

  it('guards duplicate close calls so an automatic overview dismisses once', () => {
    const onOverviewDismiss = vi.fn();
    renderProvider({ onOverviewDismiss });

    fireEvent.click(screen.getByRole('button', { name: 'Start automatic overview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close twice' }));

    expect(onOverviewDismiss).toHaveBeenCalledOnce();
  });
});
