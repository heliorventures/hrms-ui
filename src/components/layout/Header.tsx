import { Menu, Search } from 'lucide-react';
import type { RefObject } from 'react';

import { UI_PLACEHOLDER_TEXT } from '../../constants/uiText';
import { useTenant } from '../../contexts/TenantContext';
import IconButton from '../common/IconButton';

import { useCommandPalette } from './CommandPaletteContext';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  mobileNavigationOpen: boolean;
  mobileNavigationTriggerRef: RefObject<HTMLButtonElement>;
  onOpenMobileNavigation: () => void;
}

const Header = ({
  mobileNavigationOpen,
  mobileNavigationTriggerRef,
  onOpenMobileNavigation,
}: HeaderProps) => {
  const { currentTenant } = useTenant();
  const { open } = useCommandPalette();
  const shortcutLabel =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent)
      ? '⌘K'
      : 'Ctrl K';

  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-line bg-surface pb-0 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top)] shadow-card md:pl-[max(1.5rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))]">
      <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
        <IconButton
          ref={mobileNavigationTriggerRef}
          onClick={onOpenMobileNavigation}
          className="lg:hidden"
          label="Open navigation"
          icon={<Menu className="h-5 w-5" />}
          aria-controls="app-navigation"
          aria-expanded={mobileNavigationOpen}
        />

        <p
          className="max-w-[180px] truncate text-base font-semibold text-slate-900 dark:text-white sm:max-w-xs md:max-w-sm md:text-lg"
          title={currentTenant.name}
        >
          {currentTenant.name}
        </p>

        <button
          type="button"
          onClick={(event) => open(event.currentTarget)}
          className="hidden h-10 min-w-0 max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 text-left text-sm text-slate-500 shadow-sm transition hover:border-indigo-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:transition-none dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-indigo-500/50 md:flex"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{UI_PLACEHOLDER_TEXT.globalSearch}</span>
          <kbd className="hidden shrink-0 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-600 dark:bg-slate-800 lg:inline">
            {shortcutLabel}
          </kbd>
        </button>

        <IconButton
          onClick={(event) => open(event.currentTarget)}
          className="md:hidden"
          label="Search pages and tools"
          icon={<Search className="h-5 w-5" />}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
