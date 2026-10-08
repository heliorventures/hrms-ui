import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { activeNavigationDestination, groupNavigationDestinations } from './navigationSelectors';
import { PageWorkspaceContext } from './pageWorkspaceContext';
import { taskNavigationLocation } from './taskNavigation';
import { useAccessibleNavigation } from './useAccessibleNavigation';

const PageWorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const destinations = useAccessibleNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const active = activeNavigationDestination(location.pathname + location.search, destinations);
  const group = groupNavigationDestinations(destinations).find((item) =>
    item.destinations.some((destination) =>
      destination.members?.some((task) => task.path === active?.path)
    )
  );
  const workspace = group?.destinations.find((item) =>
    item.members?.some((task) => task.path === active?.path)
  );
  const tasks = workspace?.members ?? [];
  const combinedCalendar = tasks.some((task) => task.path === '/leave/team-calendar');
  return (
    <PageWorkspaceContext.Provider
      value={
        active && !combinedCalendar
          ? {
              title: `${group?.section.label ?? ''} — ${active.label}`,
              tasks,
              activePath: active.path,
              select: (path) => {
                if (tasks.some((task) => task.path === path))
                  navigate(taskNavigationLocation(location.pathname + location.search, path));
              },
            }
          : null
      }
    >
      {children}
    </PageWorkspaceContext.Provider>
  );
};
export default PageWorkspaceProvider;
