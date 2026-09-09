import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';

import { NAVIGATION_SECTIONS, type NavigationSectionKey } from '../../navigation/navigationModel';
import { activeNavigationSection } from '../../navigation/navigationSelectors';
import { useDialogSurface } from '../common/useDialogSurface';

import SidebarHeader from './SidebarHeader';
import SidebarNavigation from './SidebarNavigation';

interface SidebarProps {
  mobileOpen: boolean;
  desktopCollapsed: boolean;
  mobileTriggerRef: RefObject<HTMLButtonElement>;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}
type ExpandedState = Record<NavigationSectionKey, boolean>;
const DESKTOP_NAVIGATION_QUERY = '(min-width: 1024px)';

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

function createExpandedState(activeSection: NavigationSectionKey | null): ExpandedState {
  return Object.fromEntries(
    NAVIGATION_SECTIONS.map((section) => [section.key, section.key === activeSection])
  ) as ExpandedState;
}

const Sidebar = ({
  mobileOpen,
  desktopCollapsed,
  mobileTriggerRef,
  onCloseMobile,
  onToggleDesktop,
}: SidebarProps) => {
  const location = useLocation();
  const asideRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const desktopViewport = useDesktopNavigationViewport();
  const mobileDialogOpen = mobileOpen && !desktopViewport;
  const sidebarInteractive = mobileDialogOpen || desktopViewport;
  const activeSection = activeNavigationSection(location.pathname + location.search);
  const [expanded, setExpanded] = useState<ExpandedState>(() => createExpandedState(activeSection));

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

  useEffect(() => {
    if (!activeSection) return;
    setExpanded((current) => ({ ...current, [activeSection]: true }));
  }, [activeSection]);

  const toggleSection = (key: NavigationSectionKey) => {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  };

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
        aria-modal={mobileDialogOpen ? true : undefined}
        aria-hidden={sidebarInteractive ? undefined : true}
        aria-label="Main navigation"
        className={[
          'fixed inset-y-0 left-0 z-30 h-[100dvh] min-h-0 w-72 transform overscroll-contain border-r border-line bg-surface pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)] transition-[transform,width] duration-200 ease-out motion-reduce:transition-none',
          'lg:static lg:h-auto lg:translate-x-0 lg:pb-0 lg:pl-0 lg:pt-0',
          desktopCollapsed ? 'lg:w-20' : 'lg:w-72',
          mobileDialogOpen
            ? 'visible translate-x-0 pointer-events-auto'
            : 'invisible -translate-x-full pointer-events-none lg:visible lg:pointer-events-auto',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <SidebarHeader
            desktopCollapsed={desktopCollapsed}
            closeButtonRef={closeButtonRef}
            onCloseMobile={onCloseMobile}
            onToggleDesktop={onToggleDesktop}
          />
          <SidebarNavigation
            desktopCollapsed={desktopCollapsed}
            desktopViewport={desktopViewport}
            expanded={expanded}
            onToggleSection={toggleSection}
            onCloseMobile={onCloseMobile}
            onToggleDesktop={onToggleDesktop}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
