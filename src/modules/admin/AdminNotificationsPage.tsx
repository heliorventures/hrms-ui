import Card from '../../components/common/Card';

import { AnnouncementHistory, NotificationHistory } from './AdminNotificationsHistory';
import AnnouncementEditorForm from './components/AnnouncementEditorForm';
import DirectNotificationComposer from './components/DirectNotificationComposer';
import { useAdminNotificationsPageModel } from './useAdminNotificationsPageModel';

const AdminNotificationsPage = () => {
  const model = useAdminNotificationsPageModel();
  const { announcement } = model;
  const announcementState = announcement.state;
  const { directNotification } = model;
  const directState = directNotification.state;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Admin</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Manage announcements and send private in-app notifications to selected users.
      </p>

      {model.error ? (
        <Card>
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {model.error}
          </p>
        </Card>
      ) : null}

      {model.success ? (
        <Card>
          <p
            className="text-sm text-green-700 dark:text-green-300"
            role="status"
            aria-live="polite"
          >
            {model.success}
          </p>
        </Card>
      ) : null}

      <Card title={announcementState.editId ? 'Edit announcement' : 'New announcement (HR)'}>
        {model.loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <AnnouncementEditorForm
            body={announcementState.body}
            busy={model.busy}
            clearRoleAudience={announcementState.clearRoleAudience}
            departmentId={announcementState.departmentId}
            departments={model.data?.departments ?? []}
            documentFile={announcementState.documentFile}
            employeePost={announcementState.employeePost}
            existingRoleCode={announcement.existingRoleCode}
            expiresAt={announcementState.expiresAt}
            imageFile={announcementState.imageFile}
            isEditing={Boolean(announcementState.editId)}
            locationId={announcementState.locationId}
            publishAt={announcementState.publishAt}
            roleCode={announcementState.roleCode}
            title={announcementState.title}
            onBodyChange={(value) => announcement.setField('body', value)}
            onCancelEdit={announcement.cancelEdit}
            onClearRoleAudienceChange={(value) => announcement.setField('clearRoleAudience', value)}
            onDepartmentChange={(value) => announcement.setField('departmentId', value)}
            onDocumentChange={(file) => announcement.setField('documentFile', file)}
            onEmployeePostChange={(value) => announcement.setField('employeePost', value)}
            onExpiresAtChange={(value) => announcement.setField('expiresAt', value)}
            onImageChange={(file) => announcement.setField('imageFile', file)}
            onLocationChange={(value) => announcement.setField('locationId', value)}
            onPublishAtChange={(value) => announcement.setField('publishAt', value)}
            onRoleCodeChange={(value) => announcement.setField('roleCode', value)}
            onSubmit={announcement.submit}
            onTitleChange={(value) => announcement.setField('title', value)}
          />
        )}
      </Card>

      <Card title="Direct Notifications To Users">
        <DirectNotificationComposer
          busy={model.busy}
          employees={model.employeesWithUser}
          kind={directState.kind}
          message={directState.message}
          selectedUserIds={directState.selectedUserIds}
          title={directState.title}
          url={directState.url}
          onKindChange={(value) => directNotification.setField('kind', value)}
          onMessageChange={(value) => directNotification.setField('message', value)}
          onSelectedUserIdsChange={directNotification.setSelectedUserIds}
          onSubmit={directNotification.submit}
          onTitleChange={(value) => directNotification.setField('title', value)}
          onUrlChange={(value) => directNotification.setField('url', value)}
        />
      </Card>

      <AnnouncementHistory
        announcements={model.data?.adminAnnouncements ?? []}
        busy={model.busy}
        onEdit={announcement.startEdit}
        onDelete={(id) => void model.removeAnnouncement(id)}
      />

      <NotificationHistory
        notifications={model.data?.adminNotifications ?? []}
        busy={model.busy}
        onDelete={(id) => void model.removeInAppNotification(id)}
      />
    </div>
  );
};

export default AdminNotificationsPage;
