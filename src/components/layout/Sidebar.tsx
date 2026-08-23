import { PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';

import { canAccessTenantPath } from '../../auth/navAccess';
import { UI_A11Y_TEXT, UI_EMPTY_TEXT, UI_PLACEHOLDER_TEXT } from '../../constants/uiText';
import { useAuth } from '../../contexts/AuthContext';
import {
  NAVIGATION_DESTINATIONS,
  NAVIGATION_SECTIONS,
  type NavigationSectionKey,
} from '../../navigation/navigationModel';
import {
  accessibleDestinations,
  activeNavigationSection,
  filterNavigationDestinations,
  groupNavigationDestinations,
} from '../../navigation/navigationSelectors';
import { AppLogo } from '../brand/AppLogo';
import IconButton from '../common/IconButton';
import { useDialogSurface } from '../common/useDialogSurface';

import SidebarDestination from './SidebarDestination';
import SidebarSection from './SidebarSection';

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
  const { can, clientSession } = useAuth();
  const location = useLocation();
  const asideRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const desktopViewport = useDesktopNavigationViewport();
  const mobileDialogOpen = mobileOpen && !desktopViewport;
  const sidebarInteractive = mobileDialogOpen || desktopViewport;
  const [menuFilter, setMenuFilter] = useState('');
  const activeSection = activeNavigationSection(location.pathname);
  const [expanded, setExpanded] = useState<ExpandedState>(() => createExpandedState(activeSection));
  const tenantNavOptions = useMemo(() => ({ can, clientSession }), [can, clientSession]);

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

  const accessible = useMemo(
    () =>
      accessibleDestinations(NAVIGATION_DESTINATIONS, (path) =>
        canAccessTenantPath(path, tenantNavOptions)
      ),
    [tenantNavOptions]
  );
  const visible = useMemo(
    () => filterNavigationDestinations(accessible, menuFilter),
    [accessible, menuFilter]
  );
  const primaryDestinations = visible.filter((destination) => destination.sidebar === 'primary');
  const groups = groupNavigationDestinations(visible);
  const filterActive = menuFilter.trim().length > 0;

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
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/90 px-4 dark:border-slate-700/90">
            <AppLogo size="sm" showText className={desktopCollapsed ? 'lg:[&>span]:hidden' : ''} />
            <IconButton
              ref={closeButtonRef}
              onClick={onCloseMobile}
              className="lg:hidden"
              label={UI_A11Y_TEXT.closeSidebar}
              icon={<X className="h-5 w-5" />}
            />
            <IconButton
              onClick={onToggleDesktop}
              className={`hidden lg:inline-flex ${
                desktopCollapsed ? 'ml-auto' : ''
              }`}
              label={desktopCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              title={desktopCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              icon={desktopCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" aria-hidden />
              ) : (
                <PanelLeftClose className="h-5 w-5" aria-hidden />
              )}
            />
          </div>

          <div
            className={`border-b border-slate-200/80 px-3 py-2 dark:border-slate-700/80 ${
              desktopCollapsed ? 'lg:hidden' : ''
            }`}
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={menuFilter}
                onChange={(event) => setMenuFilter(event.target.value)}
                placeholder={UI_PLACEHOLDER_TEXT.sidebarFilter}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                aria-label={UI_A11Y_TEXT.filterSidebarMenu}
              />
            </div>
          </div>

          <nav
            className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2 pt-3"
            aria-label="HRMS pages"
          >
            <p
              className={`mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${
                desktopCollapsed ? 'lg:sr-only' : ''
              }`}
            >
              Workspace
            </p>
            {primaryDestinations.map((destination) => (
              <SidebarDestination
                key={destination.path}
                destination={destination}
                compact={desktopCollapsed}
                onNavigate={onCloseMobile}
              />
            ))}

            {groups.map(({ section, destinations }) => (
              <SidebarSection
                key={section.key}
                section={section}
                destinations={destinations}
                expanded={filterActive || expanded[section.key]}
                compact={desktopCollapsed}
                onToggle={() => toggleSection(section.key)}
                onRequestExpand={onToggleDesktop}
                onNavigate={onCloseMobile}
              />
            ))}

            {visible.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                {UI_EMPTY_TEXT.sidebarItems}
              </p>
            ) : null}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
