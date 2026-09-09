import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { RefObject } from 'react';

import { AppLogo } from '../brand/AppLogo';

const NavigationLogoToggle = ({
  collapsed,
  onToggle,
  buttonRef,
}: {
  collapsed: boolean;
  onToggle: () => void;
  buttonRef?: RefObject<HTMLButtonElement>;
}) => {
  const label = collapsed ? 'Expand navigation' : 'Collapse navigation';
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <button
      id={collapsed ? 'navigation-expand-control' : 'navigation-collapse-control'}
      ref={buttonRef}
      type="button"
      aria-label={label}
      title={label}
      aria-controls="app-navigation"
      aria-expanded={!collapsed}
      onClick={onToggle}
      className="group relative hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:inline-flex"
    >
      <span aria-hidden="true" className="group-hover:opacity-0 group-focus-visible:opacity-0">
        <AppLogo size="sm" showText={false} />
      </span>
      <Icon
        aria-hidden="true"
        className="absolute h-5 w-5 text-content-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </button>
  );
};

export default NavigationLogoToggle;
