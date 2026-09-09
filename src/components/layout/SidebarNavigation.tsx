import { useEffect, useState } from 'react';

import { UI_EMPTY_TEXT } from '../../constants/uiText';
import { groupNavigationDestinations } from '../../navigation/navigationSelectors';
import { useAccessibleNavigation } from '../../navigation/useAccessibleNavigation';

import SidebarDestination from './SidebarDestination';
import SidebarSection from './SidebarSection';

const useHoverNavigation = () => {
  const [hover, setHover] = useState(
    () => typeof window.matchMedia !== 'function' || window.matchMedia('(hover: hover)').matches
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(hover: hover)');
    const update = () => setHover(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return hover;
};

const SidebarNavigation = ({
  compact = false,
  desktopViewport,
  onCloseMobile,
}: {
  compact?: boolean;
  desktopViewport: boolean;
  onCloseMobile: () => void;
}) => {
  const hover = useHoverNavigation();
  const [touchNavigation, setTouchNavigation] = useState(false);
  const accessible = useAccessibleNavigation();
  const visible = accessible.filter((destination) => destination.sidebar);
  const groups = groupNavigationDestinations(visible);
  const entries = [
    ...visible
      .filter((destination) => destination.sidebar === 'primary')
      .map((destination) => ({ order: destination.order, destination })),
    ...groups.map((group) => ({ order: group.section.order, group })),
  ].sort((left, right) => left.order - right.order);
  return (
    <nav
      className="scrollbar-subtle min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2 pt-3"
      aria-label="HRMS pages"
      onPointerDownCapture={(event) => {
        if (event.pointerType === 'touch') setTouchNavigation(true);
      }}
    >
      {entries.map((entry) =>
        'destination' in entry ? (
          <SidebarDestination
            compact={compact}
            key={entry.destination.path}
            destination={entry.destination}
            onNavigate={onCloseMobile}
          />
        ) : (
          <SidebarSection
            compact={compact}
            key={entry.group.section.key}
            section={entry.group.section}
            destinations={entry.group.destinations}
            flyout={compact || (desktopViewport && hover && !touchNavigation)}
            onNavigate={onCloseMobile}
          />
        )
      )}
      {visible.length === 0 ? (
        <p className="px-3 py-4 text-sm text-content-secondary">{UI_EMPTY_TEXT.sidebarItems}</p>
      ) : null}
    </nav>
  );
};
export default SidebarNavigation;
