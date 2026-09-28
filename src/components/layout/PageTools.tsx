import { CircleHelp } from 'lucide-react';
import { useContext } from 'react';

import { useAccessibleNavigation } from '../../navigation/useAccessibleNavigation';
import ActionMenu, { type ActionMenuItem } from '../common/ActionMenu';
import { PageInformationContext } from '../common/pageInformationContext';

import NotificationDropdown from './NotificationDropdown';

const PageTools = () => {
  const information = useContext(PageInformationContext);
  const grievance = useAccessibleNavigation().find(
    (destination) => destination.path === '/workplace/grievance'
  );
  const items: ActionMenuItem[] = [];
  if (information?.hasInformation) {
    items.push({ id: 'guide', label: 'About this page', onSelect: information.open });
  }
  if (grievance) {
    items.push({ id: 'concern', label: grievance.label, href: grievance.path });
  }

  return (
    <aside aria-label="Page tools" className="flex shrink-0 items-center gap-1">
      <NotificationDropdown />
      {items.length > 0 ? (
        <ActionMenu label="Help" triggerIcon={<CircleHelp className="size-5" />} items={items} />
      ) : null}
    </aside>
  );
};

export default PageTools;
