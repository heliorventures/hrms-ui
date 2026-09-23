import { NavLink } from 'react-router-dom';

import { useAccessibleNavigation } from '../../navigation/useAccessibleNavigation';
import PageInformationButton from '../common/PageInformationButton';

import NotificationDropdown from './NotificationDropdown';

const toolClasses =
  '!min-h-11 !min-w-11 rounded-xl !bg-canvas !text-content-secondary hover:!bg-surface-selected';

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
      <NotificationDropdown className={toolClasses} />
      <PageInformationButton className={toolClasses} />
      {grievance && GrievanceIcon ? (
        <NavLink
          to={grievance.path}
          aria-label={grievance.label}
          title={grievance.label}
          className={({ isActive }) =>
            [
              `inline-flex items-center justify-center ${toolClasses}`,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isActive ? 'ring-2 ring-focus' : '',
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
