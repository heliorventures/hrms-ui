import { PanelLeft, PanelLeftOpen, Search, X } from 'lucide-react';
import { useLayoutEffect, useRef, type RefObject } from 'react';

import { APP_BRAND } from '../../constants/brand';
import { UI_A11Y_TEXT } from '../../constants/uiText';
import { AppLogo } from '../brand/AppLogo';
import IconButton from '../common/IconButton';

import { useCommandPalette } from './CommandPaletteContext';

const SidebarHeader = ({
  compact = false,
  companyName,
  desktopViewport,
  closeButtonRef,
  onCloseMobile,
  onToggleDesktop,
}: {
  compact?: boolean;
  companyName: string;
  desktopViewport: boolean;
  closeButtonRef: RefObject<HTMLButtonElement>;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}) => {
  const { open } = useCommandPalette();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const previousCompact = useRef(compact);
  useLayoutEffect(() => {
    if (previousCompact.current !== compact) toggleRef.current?.focus();
    previousCompact.current = compact;
  }, [compact]);
  const toggleLabel = compact ? 'Expand navigation' : 'Collapse navigation';
  return (
    <div
      className={`flex shrink-0 gap-1 px-2 py-3 ${compact ? 'flex-col items-center' : 'items-center'}`}
    >
      {compact ? (
        <AppLogo size="sm" showText={false} />
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <AppLogo size="sm" showText={false} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-content-primary" title={companyName}>
              {companyName}
            </p>
            <p className="truncate text-xs text-content-muted">{APP_BRAND.productName}</p>
          </div>
        </div>
      )}
      <IconButton
        label="Search pages and tools"
        title="Search pages and tools (Ctrl/Cmd K)"
        icon={<Search className="h-5 w-5" />}
        onClick={(event) => open(event.currentTarget)}
      />
      {desktopViewport ? (
        <IconButton
          ref={toggleRef}
          label={toggleLabel}
          title={toggleLabel}
          icon={compact ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          aria-controls="app-navigation"
          aria-expanded={!compact}
          onClick={onToggleDesktop}
        />
      ) : (
        <IconButton
          ref={closeButtonRef}
          onClick={onCloseMobile}
          className="lg:hidden"
          label={UI_A11Y_TEXT.closeSidebar}
          icon={<X className="h-5 w-5" />}
        />
      )}
    </div>
  );
};
export default SidebarHeader;
