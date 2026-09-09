import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import { useTenant } from '../../contexts/TenantContext';
import { useDialogSurface } from '../common/useDialogSurface';

import ProfileDropdown from './ProfileDropdown';
import SidebarHeader from './SidebarHeader';
import SidebarNavigation from './SidebarNavigation';

interface SidebarProps {
  mobileOpen: boolean;
  desktopCollapsed: boolean;
  mobileTriggerRef: RefObject<HTMLButtonElement>;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}
const DESKTOP_NAVIGATION_QUERY = '(min-width: 1024px)';

function navigationVisibility(desktop: boolean, mobileOpen: boolean) {
  const mobileDialogOpen = mobileOpen && !desktop;
  return {
    mobileDialogOpen,
    sidebarInteractive: mobileDialogOpen || desktop,
  };
}

function useDesktopNavigationViewport() {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' || typeof window.matchMedia !== 'function'
      ? true
      : window.matchMedia(DESKTOP_NAVIGATION_QUERY).matches
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mediaQuery = window.matchMedia(DESKTOP_NAVIGATION_QUERY);
    const update = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return matches;
}

const Sidebar = ({
  mobileOpen,
  desktopCollapsed,
  mobileTriggerRef,
  onCloseMobile,
  onToggleDesktop,
}: SidebarProps) => {
  const asideRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const desktopViewport = useDesktopNavigationViewport();
  const compact = desktopViewport && desktopCollapsed;
  const { currentTenant } = useTenant();
  const { mobileDialogOpen, sidebarInteractive } = navigationVisibility(
    desktopViewport,
    mobileOpen
  );
  useDialogSurface({
    isOpen: mobileDialogOpen,
    isDismissible: true,
    onClose: onCloseMobile,
    surfaceRef: asideRef,
    initialFocusRef: closeButtonRef,
    returnFocusRef: mobileTriggerRef,
  });

  useLayoutEffect(() => {
    asideRef.current?.toggleAttribute('inert', !sidebarInteractive);
  }, [sidebarInteractive]);

  useEffect(() => {
    if (!desktopViewport || !mobileOpen) return;
    onCloseMobile();
  }, [desktopViewport, mobileOpen, onCloseMobile]);

  return (
    <>
      {mobileDialogOpen ? (
        <button
          type="button"
          data-overlay-background-exempt
          className="fixed inset-0 z-20 cursor-default bg-slate-950/55 backdrop-blur-[1px] lg:hidden"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        id="app-navigation"
        ref={asideRef}
        role={mobileDialogOpen ? 'dialog' : undefined}
        aria-modal={mobileDialogOpen || undefined}
        aria-hidden={!sidebarInteractive || undefined}
        aria-label="Main navigation"
        className={[
          'fixed inset-y-0 left-0 z-30 h-[100dvh] min-h-0 w-72 transform overscroll-contain border-r border-line-subtle/60 bg-surface pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)] transition-[transform,width] duration-200 ease-out motion-reduce:transition-none',
          'shrink-0 lg:static lg:h-auto lg:transform-none lg:pb-0 lg:pl-0 lg:pt-0',
          desktopCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          mobileDialogOpen
            ? 'visible transform-none pointer-events-auto'
            : 'invisible -translate-x-full pointer-events-none lg:visible lg:pointer-events-auto',
        ].join(' ')}
      >
        {sidebarInteractive ? (
          <div className="flex h-full min-h-0 flex-col">
            <SidebarHeader
              compact={compact}
              companyName={currentTenant.name}
              desktopViewport={desktopViewport}
              closeButtonRef={closeButtonRef}
              onCloseMobile={onCloseMobile}
              onToggleDesktop={onToggleDesktop}
            />
            <SidebarNavigation
              compact={compact}
              desktopViewport={desktopViewport}
              onCloseMobile={onCloseMobile}
            />
            <div className="shrink-0 border-t border-line-subtle/60 bg-surface p-2">
              <ProfileDropdown
                compact={compact}
                companyName={currentTenant.name}
                onNavigate={onCloseMobile}
              />
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
};

export default Sidebar;
