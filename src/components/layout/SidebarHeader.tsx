import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import type { RefObject } from 'react';

import { UI_A11Y_TEXT } from '../../constants/uiText';
import { AppLogo } from '../brand/AppLogo';
import IconButton from '../common/IconButton';

interface SidebarHeaderProps {
  desktopCollapsed: boolean;
  closeButtonRef: RefObject<HTMLButtonElement>;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

const SidebarHeader = ({
  desktopCollapsed,
  closeButtonRef,
  onCloseMobile,
  onToggleDesktop,
}: SidebarHeaderProps) => {
  const toggleLabel = desktopCollapsed ? 'Expand navigation' : 'Collapse navigation';
  const ToggleIcon = desktopCollapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/90 px-4 dark:border-slate-700/90">
      <AppLogo size="sm" showText className={desktopCollapsed ? 'lg:[&>span]:hidden' : ''} />
      <IconButton
        ref={closeButtonRef}
        onClick={onCloseMobile}
        className="lg:hidden"
        label={UI_A11Y_TEXT.closeSidebar}
        icon={<X className="h-5 w-5" />}
      />
      <IconButton
        onClick={onToggleDesktop}
        className={`hidden lg:inline-flex ${desktopCollapsed ? 'ml-auto' : ''}`}
        label={toggleLabel}
        title={toggleLabel}
        icon={<ToggleIcon className="h-5 w-5" aria-hidden />}
      />
    </div>
  );
};

export default SidebarHeader;
