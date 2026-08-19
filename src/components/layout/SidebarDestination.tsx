import { NavLink } from 'react-router-dom';

import type { NavigationDestination } from '../../navigation/navigationModel';

interface SidebarDestinationProps {
  destination: NavigationDestination;
  compact?: boolean;
  nested?: boolean;
  onNavigate: () => void;
}

const activeClasses =
  'bg-white text-slate-950 shadow-card ring-1 ring-slate-200/90 dark:bg-slate-800 dark:text-white dark:ring-slate-600/90';
const inactiveClasses =
  'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white';

const SidebarDestination = ({
  destination,
  compact = false,
  nested = false,
  onNavigate,
}: SidebarDestinationProps) => {
  const Icon = destination.icon;

  return (
    <NavLink
      to={destination.path}
      onClick={onNavigate}
      title={compact ? destination.label : undefined}
      className={({ isActive }) =>
        [
          'mx-1 flex items-center rounded-lg text-sm font-medium transition-colors motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
          nested ? 'gap-2 px-2.5 py-2' : 'gap-3 px-3 py-2.5',
          compact ? 'lg:justify-center lg:px-2' : '',
          isActive ? activeClasses : inactiveClasses,
        ].join(' ')
      }
    >
      {Icon ? <Icon className="h-5 w-5 shrink-0" aria-hidden /> : null}
      <span className={compact ? 'lg:sr-only' : undefined}>{destination.label}</span>
    </NavLink>
  );
};

export default SidebarDestination;
