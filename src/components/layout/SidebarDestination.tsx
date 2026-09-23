import { Link, useLocation } from 'react-router-dom';

import type { NavigationDestination } from '../../navigation/navigationModel';
import { activeNavigationDestination } from '../../navigation/navigationSelectors';

interface SidebarDestinationProps {
  destination: NavigationDestination;
  compact?: boolean;
  nested?: boolean;
  onNavigate: () => void;
}

const activeClasses =
  'bg-surface-selected text-content-primary';
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
  const isActive =
    activeNavigationDestination(location.pathname + location.search)?.path === destination.path;

  return (
    <Link
      to={destination.path}
      onClick={onNavigate}
      title={compact ? destination.label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'mx-1 flex items-center rounded-lg text-sm font-medium transition-colors motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
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
