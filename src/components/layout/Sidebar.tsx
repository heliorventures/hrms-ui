import { useMemo, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { canAccessTenantPath } from '../../auth/navAccess';
import { useAuth } from '../../contexts/AuthContext';
import AppLogo from '../brand/AppLogo';
import { UI_A11Y_TEXT, UI_EMPTY_TEXT, UI_PLACEHOLDER_TEXT } from '../../constants/uiText';
import { matchesNavFilter, NAV_CATALOG } from '../../navigation/navCatalog';
import {
  SIDEBAR_GROUPS,
  SIDEBAR_PRIMARY_LINKS,
  type SidebarGroup,
  type SidebarLink,
} from '../../navigation/sidebarNavigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExpandedState = Record<string, boolean>;

const navClasses = {
  item: 'mx-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
  active:
    'bg-white text-slate-900 shadow-card ring-1 ring-slate-200/90 dark:bg-slate-800 dark:text-white dark:ring-slate-600/90',
  inactive:
    'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100',
  sub: 'mx-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
  groupButton:
    'mx-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
};

function itemMatchesMenuFilter(query: string, item: SidebarLink): boolean {
  if (!query.trim()) return true;
  const keywords = NAV_CATALOG.find((entry) => entry.path === item.path)?.keywords ?? [];
  return matchesNavFilter(query, item.label, item.path, keywords);
}

function groupHasFilterMatch(query: string, group: SidebarGroup): boolean {
  return group.children.some((child) => itemMatchesMenuFilter(query, child));
}

function initialExpanded(pathname: string): ExpandedState {
  return Object.fromEntries(
    SIDEBAR_GROUPS.map((group) => [group.key, pathname.startsWith(group.basePath)])
  );
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { can, clientSession } = useAuth();
  const location = useLocation();
  const [menuFilter, setMenuFilter] = useState('');
  const [expanded, setExpanded] = useState<ExpandedState>(() => initialExpanded(location.pathname));
  const tenantNavOpts = useMemo(() => ({ can, clientSession }), [can, clientSession]);
  const filterQuery = menuFilter.trim();
  const filterActive = filterQuery.length > 0;

  const primaryLinks = useMemo(
    () =>
      SIDEBAR_PRIMARY_LINKS.filter((item) => canAccessTenantPath(item.path, tenantNavOpts)).filter(
        (item) => itemMatchesMenuFilter(filterQuery, item)
      ),
    [filterQuery, tenantNavOpts]
  );

  const visibleGroups = useMemo(
    () =>
      SIDEBAR_GROUPS.map((group) => ({
        group,
        children: group.children
          .filter((item) => canAccessTenantPath(item.path, tenantNavOpts))
          .filter((item) => itemMatchesMenuFilter(filterQuery, item)),
        filterHit: filterActive && groupHasFilterMatch(filterQuery, group),
      })).filter(({ children, filterHit }) => children.length > 0 || filterHit),
    [filterActive, filterQuery, tenantNavOpts]
  );

  const toggleGroup = (key: string) => {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200/90 bg-white transition-transform duration-200 ease-out dark:border-slate-700/90 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <SidebarHeader onClose={onClose} />
          <SidebarFilter value={menuFilter} onChange={setMenuFilter} />
          <nav className="flex-1 space-y-1 overflow-y-auto p-2 pt-3">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Workspace
            </p>
            {primaryLinks.map((item) => (
              <SidebarNavLink key={item.path} item={item} onClose={onClose} />
            ))}
            {visibleGroups.map(({ group, children }) => (
              <SidebarNavGroup
                key={group.key}
                group={group}
                childrenLinks={children}
                expanded={
                  expanded[group.key] ||
                  location.pathname.startsWith(group.basePath) ||
                  (filterActive && children.length > 0)
                }
                filterActive={filterActive}
                onClose={onClose}
                onToggle={() => toggleGroup(group.key)}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

const SidebarHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex h-14 items-center justify-between border-b border-slate-200/90 px-4 dark:border-slate-700/90">
    <AppLogo size="sm" />
    <button
      type="button"
      onClick={onClose}
      className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
      aria-label={UI_A11Y_TEXT.closeSidebar}
    >
      <X className="h-5 w-5" />
    </button>
  </div>
);

const SidebarFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="border-b border-slate-200/80 px-3 pb-2 pt-1 dark:border-slate-700/80">
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={UI_PLACEHOLDER_TEXT.sidebarFilter}
        className="w-full rounded-lg border border-slate-200/90 bg-slate-50/90 py-1.5 pl-8 pr-2 text-xs text-slate-900 shadow-inner placeholder-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
        aria-label={UI_A11Y_TEXT.filterSidebarMenu}
      />
    </div>
  </div>
);

const SidebarNavLink = ({ item, onClose }: { item: SidebarLink; onClose: () => void }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) => `${navClasses.item} ${isActive ? navClasses.active : navClasses.inactive}`}
    >
      {Icon ? <Icon className="h-5 w-5" /> : null}
      <span>{item.label}</span>
    </NavLink>
  );
};

const SidebarNavGroup = ({
  group,
  childrenLinks,
  expanded,
  filterActive,
  onClose,
  onToggle,
}: {
  group: SidebarGroup;
  childrenLinks: SidebarLink[];
  expanded: boolean;
  filterActive: boolean;
  onClose: () => void;
  onToggle: () => void;
}) => {
  const Icon = group.icon;
  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={onToggle}
        className={`${navClasses.groupButton} ${
          expanded ? 'bg-slate-200/50 font-semibold text-slate-900 dark:bg-slate-800/80 dark:text-slate-100' : navClasses.inactive
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <span>{group.label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && childrenLinks.length > 0 ? (
        <div className="ml-2 mt-1 space-y-0.5 border-l border-slate-200/90 pl-2 dark:border-slate-600/80">
          {childrenLinks.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onClose}
              className={({ isActive }) =>
                `${navClasses.sub} ${isActive ? navClasses.active : navClasses.inactive}`
              }
            >
              <span>{child.label}</span>
            </NavLink>
          ))}
        </div>
      ) : null}
      {expanded && childrenLinks.length === 0 && filterActive ? (
        <p className="ml-2 mt-1 pl-2 text-xs text-slate-400">{UI_EMPTY_TEXT.sidebarItems}</p>
      ) : null}
    </div>
  );
};

export default Sidebar;
