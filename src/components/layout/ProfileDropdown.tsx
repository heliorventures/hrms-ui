import { LogOut, Moon, RefreshCw, Sun, UserRound } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import ActionMenu, { type ActionMenuItem } from '../common/ActionMenu';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

function devRoleSwitchEnabled(): boolean {
  return import.meta.env.DEV === true && import.meta.env.VITE_ENABLE_DEV_ROLE_SWITCH === 'true';
}

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { clientSession, user, role, switchRole, logout } = useAuth();

  const initials =
    user?.name
      ?.split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  const profilePath = clientSession?.employeeId
    ? `/organization/employees/${clientSession.employeeId}`
    : '/profile/settings';

  const handleLogout = useCallback(() => {
    void logout().finally(() => navigate('/login', { replace: true }));
  }, [logout, navigate]);

  const handleRoleSwitch = useCallback(() => {
    switchRole(role === 'employee' ? 'admin' : 'employee');
  }, [role, switchRole]);

  const items = useMemo<readonly ActionMenuItem[]>(() => {
    const profileItems: ActionMenuItem[] = [
      {
        id: 'profile',
        label: 'Profile settings',
        href: profilePath,
        icon: <UserRound className="h-5 w-5" />,
      },
      {
        id: 'theme',
        label: `Theme: ${theme === 'light' ? 'Dark' : 'Light'} mode`,
        onSelect: toggleTheme,
        icon:
          theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          ),
      },
    ];

    if (devRoleSwitchEnabled()) {
      profileItems.push({
        id: 'dev-role',
        label: `Dev: switch to ${role === 'employee' ? 'Admin' : 'Employee'}`,
        onSelect: handleRoleSwitch,
        icon: <RefreshCw className="h-5 w-5" />,
      });
    }

    profileItems.push({
      id: 'logout',
      label: 'Log out',
      onSelect: handleLogout,
      icon: <LogOut className="h-5 w-5" />,
      tone: 'danger',
    });
    return profileItems;
  }, [handleLogout, handleRoleSwitch, profilePath, role, theme, toggleTheme]);

  return (
    <div className="flex min-h-11 items-center rounded-lg text-content-secondary">
      <div
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface-selected text-sm font-semibold text-content-primary"
      >
        {initials}
      </div>
      <span className="ml-2 hidden max-w-[120px] truncate text-sm font-medium sm:block">
        {user?.name}
      </span>
      <ActionMenu label="User menu" items={items} align="end" />
    </div>
  );
};

export default ProfileDropdown;
