import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { UI_A11Y_TEXT, UI_EMPTY_TEXT, UI_PLACEHOLDER_TEXT } from '../../constants/uiText';
import type { NavigationSectionKey } from '../../navigation/navigationModel';
import {
  filterNavigationDestinations,
  groupNavigationDestinations,
} from '../../navigation/navigationSelectors';
import { useAccessibleNavigation } from '../../navigation/useAccessibleNavigation';

import SidebarDestination from './SidebarDestination';
import SidebarSection from './SidebarSection';

interface SidebarNavigationProps {
  desktopCollapsed: boolean;
  desktopViewport: boolean;
  expanded: Record<NavigationSectionKey, boolean>;
  onToggleSection: (key: NavigationSectionKey) => void;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

const SidebarNavigation = ({
  desktopCollapsed,
  desktopViewport,
  expanded,
  onToggleSection,
  onCloseMobile,
  onToggleDesktop,
}: SidebarNavigationProps) => {
  const [menuFilter, setMenuFilter] = useState('');
  const accessible = useAccessibleNavigation();
  const visible = useMemo(
    () =>
      filterNavigationDestinations(
        accessible.filter((destination) => destination.sidebar),
        menuFilter
      ),
    [accessible, menuFilter]
  );
  const groups = groupNavigationDestinations(visible);
  const entries = [
    ...visible
      .filter((destination) => destination.sidebar === 'primary')
      .map((destination) => ({ order: destination.order, destination })),
    ...groups.map((group) => ({ order: group.section.order, group })),
  ].sort((left, right) => left.order - right.order);
  const filterActive = menuFilter.trim().length > 0;
  return (
    <>
      <div
        className={`border-b border-slate-200/80 px-3 py-2 dark:border-slate-700/80 ${desktopCollapsed ? 'lg:hidden' : ''}`}
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
            aria-label={UI_A11Y_TEXT.filterSidebarMenu}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>
      <nav
        className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2 pt-3"
        aria-label="HRMS pages"
      >
        <p
          className={`mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${desktopCollapsed ? 'lg:sr-only' : ''}`}
        >
          Workspace
        </p>
        {entries.map((entry) =>
          'destination' in entry ? (
            <SidebarDestination
              key={entry.destination.path}
              destination={entry.destination}
              compact={desktopCollapsed}
              onNavigate={onCloseMobile}
            />
          ) : (
            <SidebarSection
              key={entry.group.section.key}
              section={entry.group.section}
              destinations={entry.group.destinations}
              expanded={filterActive || expanded[entry.group.section.key]}
              compact={desktopCollapsed}
              onToggle={() => onToggleSection(entry.group.section.key)}
              flyout={desktopViewport && !filterActive}
              onRequestExpand={onToggleDesktop}
              onNavigate={onCloseMobile}
            />
          )
        )}
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500">
            {UI_EMPTY_TEXT.sidebarItems}
          </p>
        ) : null}
      </nav>
    </>
  );
};

export default SidebarNavigation;
