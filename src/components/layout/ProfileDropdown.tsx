import { LogOut, Moon, RefreshCw, Sun, UserRound } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useEmployeeDisplayName } from '../../contexts/employeeDisplayNameContext';
import { useTheme } from '../../contexts/ThemeContext';
import ActionMenu, { type ActionMenuItem } from '../common/ActionMenu';

function devRoleSwitchEnabled(): boolean {
  return import.meta.env.DEV === true && import.meta.env.VITE_ENABLE_DEV_ROLE_SWITCH === 'true';
}

const ProfileDropdown = ({
  onNavigate,
  compact = false,
  companyName,
}: {
  onNavigate?: () => void;
  compact?: boolean;
  companyName?: string;
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { clientSession, role, switchRole, logout } = useAuth();
  const displayName = useEmployeeDisplayName();

  const initials =
    displayName
      .split(' ')
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
        icon: theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />,
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

  const avatar = (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface-selected text-sm font-semibold text-content-primary">
      {initials}
    </span>
  );
  const menu = (
    <ActionMenu
      label="User menu"
      items={items}
      align="end"
      onNavigate={onNavigate}
      triggerIcon={compact ? avatar : undefined}
      header={
        companyName ? (
          <>
            <p className="truncate font-medium">{displayName}</p>
            <p className="truncate text-xs text-content-muted">{companyName}</p>
          </>
        ) : undefined
      }
    />
  );
  if (compact) return <div className="flex justify-center">{menu}</div>;

  return (
    <div className="flex min-h-11 w-full min-w-0 items-center rounded-lg text-content-secondary">
      <div
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface-selected text-sm font-semibold text-content-primary"
      >
        {initials}
      </div>
      <span className="ml-2 min-w-0 flex-1 truncate text-sm font-medium" title={displayName}>
        {displayName}
      </span>
      {menu}
    </div>
  );
};

export default ProfileDropdown;
