import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import type { NavigationDestination } from '../../navigation/navigationModel';
import { activeNavigationDestination } from '../../navigation/navigationSelectors';
import { PageWorkspaceContext } from '../../navigation/pageWorkspaceContext';

interface SidebarDestinationProps {
  destination: NavigationDestination;
  compact?: boolean;
  nested?: boolean;
  onNavigate: () => void;
}

const activeClasses = 'bg-surface-selected font-semibold text-accent';
const inactiveClasses =
  'text-content-secondary hover:bg-surface-selected hover:text-content-primary';

const SidebarDestination = ({
  destination,
  compact = false,
  nested = false,
  onNavigate,
}: SidebarDestinationProps) => {
  const Icon = destination.icon;
  const location = useLocation();
  const workspace = useContext(PageWorkspaceContext);
  const activePath =
    workspace?.activePath ?? activeNavigationDestination(location.pathname + location.search)?.path;
  const isActive = destination.members
    ? destination.members.some((member) => member.path === activePath)
    : activePath === destination.path;

  return (
    <Link
      to={destination.path}
      onClick={onNavigate}
      data-tour-anchor={destination.path === '/dashboard' ? 'navigation-home' : undefined}
      title={compact ? destination.label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={[
        `app-sidebar-destination ${nested ? '' : 'app-sidebar-link'} mx-1 flex items-center rounded-lg text-sm font-medium transition-colors motion-reduce:transition-none`,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        nested ? 'gap-2 px-2.5 py-2' : 'gap-3 px-3 py-2.5',
        compact ? 'lg:justify-center lg:px-2' : '',
        isActive ? activeClasses : inactiveClasses,
      ].join(' ')}
    >
      {Icon ? <Icon className="h-5 w-5 shrink-0" aria-hidden /> : null}
      <span className={compact ? 'lg:sr-only' : undefined}>{destination.label}</span>
    </Link>
  );
};

export default SidebarDestination;
