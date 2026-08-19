import { Menu, Search } from 'lucide-react';
import type { RefObject } from 'react';

import { UI_PLACEHOLDER_TEXT } from '../../constants/uiText';
import { useTenant } from '../../contexts/TenantContext';

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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-4 shadow-card dark:border-slate-700/90 dark:bg-slate-900 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
        <button
          ref={mobileNavigationTriggerRef}
          type="button"
          onClick={onOpenMobileNavigation}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open navigation"
          aria-controls="app-navigation"
          aria-expanded={mobileNavigationOpen}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <p
          className="max-w-[180px] truncate text-base font-semibold text-slate-900 dark:text-white sm:max-w-xs md:max-w-sm md:text-lg"
          title={currentTenant.name}
        >
          {currentTenant.name}
        </p>

        <button
          type="button"
          onClick={() => open()}
          className="hidden h-10 min-w-0 max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 text-left text-sm text-slate-500 shadow-sm transition hover:border-indigo-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:transition-none dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-indigo-500/50 md:flex"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{UI_PLACEHOLDER_TEXT.globalSearch}</span>
          <kbd className="hidden shrink-0 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-600 dark:bg-slate-800 lg:inline">
            {shortcutLabel}
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => open()}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          aria-label="Search pages and tools"
        >
          <Search className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
