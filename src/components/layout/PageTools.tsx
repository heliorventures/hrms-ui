import { NavLink } from 'react-router-dom';

import { useAccessibleNavigation } from '../../navigation/useAccessibleNavigation';
import PageInformationButton from '../common/PageInformationButton';

import NotificationDropdown from './NotificationDropdown';

const PageTools = () => {
  const grievance = useAccessibleNavigation().find(
    (destination) => destination.path === '/workplace/grievance'
  );
  const GrievanceIcon = grievance?.icon;

  return (
    <aside
      aria-label="Page tools"
      className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-20 flex flex-col items-center gap-1 rounded-2xl border border-line-subtle/60 bg-surface p-1 shadow-card-md print:hidden"
    >
      <NotificationDropdown className="!min-h-11 !min-w-11 rounded-xl !bg-amber-100 !text-amber-800 hover:!bg-amber-200 dark:!bg-amber-950 dark:!text-amber-200 dark:hover:!bg-amber-900" />
      <PageInformationButton className="!min-h-11 !min-w-11 rounded-xl !bg-sky-100 !text-sky-800 hover:!bg-sky-200 dark:!bg-sky-950 dark:!text-sky-200 dark:hover:!bg-sky-900" />
      {grievance && GrievanceIcon ? (
        <NavLink
          to={grievance.path}
          aria-label={grievance.label}
          title={grievance.label}
          className={({ isActive }) =>
            [
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:hover:bg-violet-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isActive ? 'ring-2 ring-violet-500' : '',
            ].join(' ')
          }
        >
          <GrievanceIcon className="h-5 w-5" aria-hidden="true" />
        </NavLink>
      ) : null}
    </aside>
  );
};

export default PageTools;
