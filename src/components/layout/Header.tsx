import { useTenant } from '../../contexts/TenantContext';
import GlobalSearch from './GlobalSearch';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { currentTenant } = useTenant();

  return (
    <header className="flex h-16 items-center justify-between border-b border-primary-200 bg-gradient-to-r from-primary-600 to-purple-600 px-4 shadow-lg dark:border-gray-700 dark:from-primary-800 dark:to-purple-900 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-white transition-all hover:bg-white/20 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        
        <h1 className="text-xl font-semibold text-white drop-shadow-md">
          {currentTenant.name}
        </h1>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
