import { useTenant } from '../../contexts/TenantContext';
import { UI_PLACEHOLDER_TEXT } from '../../constants/uiText';
import { useCommandPalette } from './CommandPaletteContext';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { currentTenant } = useTenant();
  const { open } = useCommandPalette();
  const shortcutLabel =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent) ? '⌘K' : 'Ctrl K';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-4 shadow-card dark:border-slate-700/90 dark:bg-slate-900 md:px-6">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h1 className="max-w-[200px] truncate text-base font-semibold text-slate-900 dark:text-white sm:max-w-xs md:max-w-md md:text-lg">
          {currentTenant.name}
        </h1>
        <button
          type="button"
          onClick={() => open()}
          className="hidden h-9 min-w-0 max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 text-left text-sm text-slate-500 shadow-sm transition hover:border-indigo-200 hover:bg-white dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-indigo-500/30 md:flex"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="min-w-0 flex-1 truncate">{UI_PLACEHOLDER_TEXT.globalSearch}</span>
          <kbd className="hidden shrink-0 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-600 dark:bg-slate-800 lg:inline">
            {shortcutLabel}
          </kbd>
        </button>
        <button
          type="button"
          onClick={() => open()}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open Search And Navigation"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
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
