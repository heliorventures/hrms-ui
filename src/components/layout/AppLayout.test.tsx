// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AppLayout from './AppLayout';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, logout: vi.fn() }),
}));

vi.mock('../../contexts/DialogContext', () => ({
  DialogProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../../hooks/useIdleLogout', () => ({ useIdleLogout: vi.fn() }));

vi.mock('./Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('./Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('./CommandPalette', () => ({
  default: () => null,
}));

function RouteControls() {
  const navigate = useNavigate();
  const location = useLocation();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [deferredPathname, setDeferredPathname] = useState<string | null>(null);
  const routeContext = useOutletContext<{
    onRouteContentCommit?: (commit: { locationKey: string; pathname: string }) => void;
  }>();

  useEffect(() => {
    if (deferredPathname === location.pathname) return;
    routeContext?.onRouteContentCommit?.({
      locationKey: location.key,
      pathname: location.pathname,
    });
  }, [deferredPathname, location.key, location.pathname, routeContext]);

  return (
    <section>
      <h1>{location.pathname}</h1>
      <output data-testid="location">
        {location.pathname}
        {location.search}
        {location.hash}
      </output>
      <button type="button" onClick={() => navigate('/leave')}>
        Push leave
      </button>
      <button
        type="button"
        onClick={() => {
          setDeferredPathname('/leave');
          navigate('/leave');
        }}
      >
        Push pending leave
      </button>
      <button type="button" onClick={() => setDeferredPathname(null)}>
        Commit pending route
      </button>
      <button type="button" onClick={() => navigate('/dashboard')}>
        Push dashboard
      </button>
      <button type="button" onClick={() => navigate('/payroll', { replace: true })}>
        Replace payroll
      </button>
      <button
        type="button"
        onClick={() =>
          navigate('/leave', {
            state: {
              ...(location.state as Record<string, unknown> | null),
              __heliorMainFocusHandoff: true,
            },
          })
        }
      >
        Select leave from shell
      </button>
      <button type="button" onClick={() => navigate(`${location.pathname}?status=open`)}>
        Change query
      </button>
      <button
        type="button"
        onClick={() => navigate(`${location.pathname}?status=closed`, { replace: true })}
      >
        Replace query
      </button>
      <button type="button" onClick={() => navigate(`${location.pathname}#details`)}>
        Change hash
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        Forward
      </button>
      <button
        type="button"
        onClick={(event) => {
          setOverlayOpen(true);
          event.currentTarget.focus();
        }}
      >
        Open overlay
      </button>
      <button type="button" onClick={() => navigate('/organization')}>
        Navigate under overlay
      </button>
      {overlayOpen ? (
        <div role="dialog" aria-modal="true" aria-label="Open dialog">
          Dialog
        </div>
      ) : null}
    </section>
  );
}

function renderLayout(initialEntries = ['/dashboard']) {
  document.body.innerHTML = '<div id="root"></div>';
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="*" element={<AppLayout />}>
          <Route path="*" element={<RouteControls />} />
        </Route>
      </Routes>
    </MemoryRouter>,
    { container: document.getElementById('root') ?? undefined }
  );
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('AppLayout', () => {
  it('provides a focus-visible skip link and a labelled programmatic main target', async () => {
    renderLayout();

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    const main = screen.getByRole('main', { name: 'Main content' });
    expect(skipLink.getAttribute('href')).toBe('#main-content');
    expect(skipLink.className).toContain('focus:');
    expect(main.id).toBe('main-content');
    expect(main.tabIndex).toBe(-1);
    expect(main.getAttribute('data-scroll-container')).toBe('main-content');
    await waitFor(() => expect(document.activeElement).toBe(main));
  });

  it('focuses main on pathname changes but not query or hash-only navigation', async () => {
    renderLayout();
    const main = screen.getByRole('main', { name: 'Main content' });
    await waitFor(() => expect(document.activeElement).toBe(main));

    const queryButton = screen.getByRole('button', { name: 'Change query' });
    queryButton.focus();
    fireEvent.click(queryButton);
    await waitFor(() => expect(screen.getByRole('heading', { name: '/dashboard' })).toBeTruthy());
    expect(document.activeElement).toBe(queryButton);

    const hashButton = screen.getByRole('button', { name: 'Change hash' });
    hashButton.focus();
    fireEvent.click(hashButton);
    await waitFor(() => expect(screen.getByRole('heading', { name: '/dashboard' })).toBeTruthy());
    expect(document.activeElement).toBe(hashButton);

    fireEvent.click(screen.getByRole('button', { name: 'Push leave' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: '/leave' })).toBeTruthy());
    expect(document.activeElement).toBe(main);
  });

  it('defers pathname focus and scroll reset until authorized route content commits', async () => {
    renderLayout();
    const main = screen.getByRole('main', { name: 'Main content' });
    await waitFor(() => expect(document.activeElement).toBe(main));

    main.scrollTop = 90;
    const pendingNavigation = screen.getByRole('button', { name: 'Push pending leave' });
    pendingNavigation.focus();
    fireEvent.click(pendingNavigation);
    await waitFor(() => expect(screen.getByRole('heading', { name: '/leave' })).toBeTruthy());
    expect(document.activeElement).toBe(pendingNavigation);
    expect(main.scrollTop).toBe(90);

    fireEvent.click(screen.getByRole('button', { name: 'Commit pending route' }));
    await waitFor(() => expect(document.activeElement).toBe(main));
    expect(main.scrollTop).toBe(0);
  });

  it('resets PUSH and REPLACE while restoring the named scroller by POP entry key', async () => {
    renderLayout();
    const main = screen.getByRole('main', { name: 'Main content' });
    await waitFor(() => expect(document.activeElement).toBe(main));

    main.scrollTop = 120;
    fireEvent.click(screen.getByRole('button', { name: 'Push leave' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: '/leave' })).toBeTruthy());
    expect(main.scrollTop).toBe(0);

    main.scrollTop = 140;
    fireEvent.click(screen.getByRole('button', { name: 'Replace payroll' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: '/payroll' })).toBeTruthy());
    expect(main.scrollTop).toBe(0);

    main.scrollTop = 180;
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: '/dashboard' })).toBeTruthy());
    expect(main.scrollTop).toBe(120);

    fireEvent.click(screen.getByRole('button', { name: 'Forward' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: '/payroll' })).toBeTruthy());
    expect(main.scrollTop).toBe(180);
  });

  it('restores same-path query and hash POP entries without moving focus', async () => {
    renderLayout();
    const main = screen.getByRole('main', { name: 'Main content' });
    await waitFor(() => expect(document.activeElement).toBe(main));

    main.scrollTop = 120;
    const queryButton = screen.getByRole('button', { name: 'Change query' });
    queryButton.focus();
    fireEvent.click(queryButton);
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/dashboard?status=open'));
    expect(main.scrollTop).toBe(120);
    expect(document.activeElement).toBe(queryButton);

    main.scrollTop = 200;
    const hashButton = screen.getByRole('button', { name: 'Change hash' });
    hashButton.focus();
    fireEvent.click(hashButton);
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/dashboard#details'));
    expect(main.scrollTop).toBe(200);
    expect(document.activeElement).toBe(hashButton);

    main.scrollTop = 260;
    const backButton = screen.getByRole('button', { name: 'Back' });
    backButton.focus();
    fireEvent.click(backButton);
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/dashboard?status=open'));
    expect(main.scrollTop).toBe(200);
    expect(document.activeElement).toBe(backButton);

    fireEvent.click(backButton);
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/dashboard'));
    expect(main.scrollTop).toBe(120);
    expect(document.activeElement).toBe(backButton);

    const forwardButton = screen.getByRole('button', { name: 'Forward' });
    forwardButton.focus();
    fireEvent.click(forwardButton);
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/dashboard?status=open'));
    expect(main.scrollTop).toBe(200);
    expect(document.activeElement).toBe(forwardButton);

    fireEvent.click(forwardButton);
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/dashboard#details'));
    expect(main.scrollTop).toBe(260);
    expect(document.activeElement).toBe(forwardButton);

    const replaceQueryButton = screen.getByRole('button', { name: 'Replace query' });
    replaceQueryButton.focus();
    fireEvent.click(replaceQueryButton);
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe('/dashboard?status=closed')
    );
    expect(main.scrollTop).toBe(260);
    expect(document.activeElement).toBe(replaceQueryButton);
  });

  it('scopes shell focus handoff to the selected history entry without pathname leakage', async () => {
    renderLayout();
    const main = screen.getByRole('main', { name: 'Main content' });
    await waitFor(() => expect(document.activeElement).toBe(main));

    const shellSelection = screen.getByRole('button', { name: 'Select leave from shell' });
    shellSelection.focus();
    fireEvent.click(shellSelection);
    await waitFor(() => expect(screen.getByRole('heading', { name: '/leave' })).toBeTruthy());
    expect(document.activeElement).toBe(shellSelection);

    fireEvent.click(screen.getByRole('button', { name: 'Push dashboard' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: '/dashboard' })).toBeTruthy());
    expect(document.activeElement).toBe(main);

    const plainLeave = screen.getByRole('button', { name: 'Push leave' });
    plainLeave.focus();
    fireEvent.click(plainLeave);
    await waitFor(() => expect(screen.getByRole('heading', { name: '/leave' })).toBeTruthy());
    expect(document.activeElement).toBe(main);
  });

  it('does not steal focus from an open overlay during pathname navigation', async () => {
    renderLayout();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('main', { name: 'Main content' }))
    );

    const opener = screen.getByRole('button', { name: 'Open overlay' });
    fireEvent.click(opener);
    expect(screen.getByRole('dialog', { name: 'Open dialog' })).toBeTruthy();
    const main = screen.getByRole('main', { name: 'Main content' });
    main.scrollTop = 125;
    fireEvent.click(screen.getByRole('button', { name: 'Navigate under overlay' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: '/organization' })).toBeTruthy());

    expect(document.activeElement).toBe(opener);
    expect(main.scrollTop).toBe(125);
  });

  it('uses dynamic viewport and safe-area-aware shell classes', () => {
    renderLayout();
    const main = screen.getByRole('main', { name: 'Main content' });
    const root = document.getElementById('app-shell');

    expect(root?.className).toContain('min-h-[100dvh]');
    expect(root?.className).not.toContain('h-screen');
    expect(main.className).toContain('safe-area-inset-bottom');
    expect(main.firstElementChild?.className).toContain('safe-area-inset-left');
    expect(main.firstElementChild?.className).toContain('safe-area-inset-right');
  });
});
