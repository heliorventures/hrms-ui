import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useIdleLogout } from '../../hooks/useIdleLogout';
import {
  readDesktopNavigationCollapsed,
  writeDesktopNavigationCollapsed,
} from '../../navigation/navigationPreference';

import CommandPalette from './CommandPalette';
import Header from './Header';
import {
  hasMainFocusHandoff,
  type RouteContentCommit,
  type RouteContentOutletContext,
} from './routeFocus';
import Sidebar from './Sidebar';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

interface PendingRouteCommit extends RouteContentCommit {
  focusMain: boolean;
  resetScroll: boolean;
  shellFocusHandoff: boolean;
}

function shellOverlayIsOpen(): boolean {
  return Boolean(
    document.querySelector('[aria-modal="true"], [data-popover-panel="true"]')
  );
}

const AppLayout = () => {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [desktopNavigationCollapsed, setDesktopNavigationCollapsed] = useState(() =>
    readDesktopNavigationCollapsed()
  );
  const mobileNavigationTriggerRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousLocationRef = useRef<{ key: string; pathname: string } | null>(null);
  const scrollPositionsRef = useRef(new Map<string, number>());
  const consumedHandoffKeysRef = useRef(new Set<string>());
  const pendingRouteCommitRef = useRef<PendingRouteCommit | null>(null);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const previousLocation = previousLocationRef.current;
    const pathnameChanged = previousLocation?.pathname !== location.pathname;
    if (previousLocation && previousLocation.key !== location.key) {
      scrollPositionsRef.current.set(previousLocation.key, main.scrollTop);
    }
    previousLocationRef.current = { key: location.key, pathname: location.pathname };

    if (previousLocation && navigationType === 'POP') {
      main.scrollTop = scrollPositionsRef.current.get(location.key) ?? 0;
    }

    pendingRouteCommitRef.current =
      !previousLocation || pathnameChanged
        ? {
            locationKey: location.key,
            pathname: location.pathname,
            focusMain: !previousLocation || navigationType !== 'POP',
            resetScroll: Boolean(previousLocation && navigationType !== 'POP'),
            shellFocusHandoff: hasMainFocusHandoff(location.state),
          }
        : null;
  }, [location.key, location.pathname, location.state, navigationType]);

  const onRouteContentCommit = useCallback((commit: RouteContentCommit) => {
    const pending = pendingRouteCommitRef.current;
    if (
      !pending ||
      pending.locationKey !== commit.locationKey ||
      pending.pathname !== commit.pathname
    ) {
      return;
    }
    pendingRouteCommitRef.current = null;

    const main = mainRef.current;
    if (!main || shellOverlayIsOpen()) return;
    if (pending.resetScroll) main.scrollTop = 0;

    const hasUnconsumedHandoff =
      pending.shellFocusHandoff &&
      !consumedHandoffKeysRef.current.has(pending.locationKey);
    if (hasUnconsumedHandoff) {
      consumedHandoffKeysRef.current.add(pending.locationKey);
    }
    if (!pending.focusMain || hasUnconsumedHandoff) return;
    main.focus({ preventScroll: true });
  }, []);

  const onRouteStateCommit = useCallback((commit: RouteContentCommit) => {
    const pending = pendingRouteCommitRef.current;
    if (
      pending?.locationKey === commit.locationKey &&
      pending.pathname === commit.pathname
    ) {
      pendingRouteCommitRef.current = null;
    }
  }, []);

  const routeOutletContext = useMemo<RouteContentOutletContext>(
    () => ({ onRouteContentCommit, onRouteStateCommit }),
    [onRouteContentCommit, onRouteStateCommit]
  );

  useIdleLogout({
    enabled: isAuthenticated,
    timeoutMs: IDLE_TIMEOUT_MS,
    onIdle: () => {
      void logout().finally(() => {
        navigate('/login', { replace: true });
      });
    },
  });

  const toggleDesktopNavigation = () => {
    setDesktopNavigationCollapsed((current) => {
      const next = !current;
      writeDesktopNavigationCollapsed(next);
      return next;
    });
  };

  return (
    <div
      id="app-shell"
      className="flex h-[100dvh] min-h-[100dvh] overflow-hidden bg-canvas text-content-primary"
    >
      <a
        href="#main-content"
        className="fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(0.5rem,env(safe-area-inset-top))] z-[120] -translate-y-24 rounded-md bg-accent px-4 py-2 text-content-inverse shadow-lg transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none"
      >
        Skip to main content
      </a>
      <Sidebar
        mobileOpen={mobileNavigationOpen}
        desktopCollapsed={desktopNavigationCollapsed}
        mobileTriggerRef={mobileNavigationTriggerRef}
        onCloseMobile={() => setMobileNavigationOpen(false)}
        onToggleDesktop={toggleDesktopNavigation}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          mobileNavigationOpen={mobileNavigationOpen}
          mobileNavigationTriggerRef={mobileNavigationTriggerRef}
          onOpenMobileNavigation={() => setMobileNavigationOpen(true)}
        />

        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          aria-label="Main content"
          data-scroll-container="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-[env(safe-area-inset-bottom)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
        >
          <div className="mx-auto max-w-7xl py-5 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:py-7 md:pl-[max(1.5rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))] lg:pl-[max(2rem,env(safe-area-inset-left))] lg:pr-[max(2rem,env(safe-area-inset-right))]">
            <Outlet context={routeOutletContext} />
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
};

export default AppLayout;
