import { Bell } from 'lucide-react';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { sessionMatchesTenant } from '../../auth/tenantSession';
import { NAV_LABELS } from '../../constants/uiText';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { authorizedNotificationActionUrl } from '../../utils/actionUrl';
import IconButton from '../common/IconButton';
import { useAnchoredPopoverPosition } from '../common/useAnchoredPopoverPosition';
import { usePopover } from '../common/usePopover';

import NotificationDropdownPanel from './NotificationDropdownPanel';
import { type BoardNotification, useNotificationDropdownData } from './useNotificationDropdownData';

const NotificationDropdown = () => {
  const { can, clientSession, isAuthenticated, tenantId } = useAuth();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const headingId = useId();
  const popover = usePopover({ open: isOpen, onClose: () => setIsOpen(false) });
  const position = useAnchoredPopoverPosition({
    align: 'end',
    open: isOpen,
    panelRef: popover.panelRef,
    triggerRef: popover.triggerRef,
  });
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
          ref={popover.triggerRef}
          label={triggerLabel}
          icon={<Bell className="h-5 w-5" />}
          aria-expanded={popover.triggerProps['aria-expanded']}
          aria-controls={popover.triggerProps['aria-controls']}
          onKeyDown={popover.triggerProps.onKeyDown}
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

      {isOpen ? (
        <NotificationDropdownPanel
          countError={dropdown.countError}
          headingId={headingId}
          notifications={dropdown.notifications}
          onClose={() => setIsOpen(false)}
          onNotificationOpen={openNotification}
          panelProps={popover.panelProps}
          panelRef={popover.panelRef}
          position={position}
          previewError={dropdown.previewError}
          previewLoaded={dropdown.previewLoaded}
          previewLoading={dropdown.previewLoading}
          previewMayBeCapped={dropdown.previewMayBeCapped}
          refreshCount={dropdown.refreshCount}
          refreshPreview={dropdown.refreshPreview}
          unreadCount={dropdown.unreadCount}
        />
      ) : null}
    </div>
  );
};

export default NotificationDropdown;
