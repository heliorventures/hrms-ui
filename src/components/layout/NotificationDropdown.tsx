import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { sessionMatchesTenant } from '../../auth/tenantSession';
import { NAV_LABELS } from '../../constants/uiText';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { authorizedNotificationActionUrl } from '../../utils/actionUrl';
import Drawer from '../common/Drawer';
import IconButton from '../common/IconButton';

import NotificationDropdownPanel from './NotificationDropdownPanel';
import { type BoardNotification, useNotificationDropdownData } from './useNotificationDropdownData';

const NotificationDropdown = () => {
  const { can, clientSession, isAuthenticated, tenantId } = useAuth();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdown = useNotificationDropdownData({ isAuthenticated, isOpen });

  if (!isAuthenticated) return null;

  const triggerLabel =
    dropdown.unreadCount > 0
      ? `${NAV_LABELS.notifications}, ${dropdown.unreadCount} unread`
      : NAV_LABELS.notifications;

  const openNotification = (notification: BoardNotification) => {
    void dropdown.markRead(notification);
    const actionUrl = sessionMatchesTenant(tenantId, currentTenant.id)
      ? authorizedNotificationActionUrl(notification.actionUrl, { can, clientSession })
      : null;
    navigate(actionUrl ?? '/notifications');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex">
      <span className="relative inline-flex">
        <IconButton
          label={triggerLabel}
          icon={<Bell className="h-5 w-5" />}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          onClick={() => setIsOpen((current) => !current)}
        />
        {dropdown.unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-status-danger px-1 text-xs font-bold text-content-inverse"
          >
            {dropdown.unreadCount > 9 ? '9+' : dropdown.unreadCount}
          </span>
        ) : null}
      </span>

      <Drawer title="Notifications" isOpen={isOpen} onClose={() => setIsOpen(false)} side="right">
        <NotificationDropdownPanel
          countError={dropdown.countError}
          notifications={dropdown.notifications}
          onClose={() => setIsOpen(false)}
          onNotificationOpen={openNotification}
          previewError={dropdown.previewError}
          previewLoaded={dropdown.previewLoaded}
          previewLoading={dropdown.previewLoading}
          previewMayBeCapped={dropdown.previewMayBeCapped}
          refreshCount={dropdown.refreshCount}
          refreshPreview={dropdown.refreshPreview}
          unreadCount={dropdown.unreadCount}
        />
      </Drawer>
    </div>
  );
};

export default NotificationDropdown;
