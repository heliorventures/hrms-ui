import { CircleHelp } from 'lucide-react';
import { useContext } from 'react';

import { useGuidance } from '../../guidance/useGuidance';
import { useAccessibleNavigation } from '../../navigation/useAccessibleNavigation';
import ActionMenu, { type ActionMenuItem } from '../common/ActionMenu';
import { PageInformationContext } from '../common/pageInformationContext';

import NotificationDropdown from './NotificationDropdown';

const PageTools = () => {
  const information = useContext(PageInformationContext);
  const { hasPageTour, startOverview, startPageTour } = useGuidance();
  const grievance = useAccessibleNavigation().find(
    (destination) => destination.path === '/workplace/grievance'
  );
  const items: ActionMenuItem[] = [];
  if (information?.hasInformation) {
    items.push({ id: 'guide', label: 'About this page', onSelect: () => information.open() });
  }
  items.push({
    id: 'overview',
    label: 'Replay application overview',
    onSelect: () => startOverview(),
  });
  if (hasPageTour) {
    items.push({ id: 'page-tour', label: 'Start page tour', onSelect: startPageTour });
  }
  if (grievance) {
    items.push({ id: 'concern', label: grievance.label, href: grievance.path });
  }

  return (
    <aside aria-label="Page tools" className="flex shrink-0 items-center gap-1">
      <NotificationDropdown />
      <ActionMenu label="Help" triggerIcon={<CircleHelp className="size-5" />} items={items} />
    </aside>
  );
};

export default PageTools;
