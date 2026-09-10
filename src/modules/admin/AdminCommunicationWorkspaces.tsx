import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { PageTabPanel } from '../../components/common/PageTabs';

import { AnnouncementHistory, NotificationHistory } from './AdminNotificationsHistory';
import AnnouncementEditorForm from './components/AnnouncementEditorForm';
import DirectNotificationComposer from './components/DirectNotificationComposer';
import type { useAdminNotificationsPageModel } from './useAdminNotificationsPageModel';

type Model = ReturnType<typeof useAdminNotificationsPageModel>;
interface WorkspaceProps {
  model: Model;
  tab: string;
}

const AdminAnnouncementEditor = ({ model, onCancel }: { model: Model; onCancel: () => void }) => {
  const { announcement } = model;
  const announcementState = announcement.state;
  return (
    <AnnouncementEditorForm
      body={announcementState.body}
      busy={model.busy}
      clearRoleAudience={announcementState.clearRoleAudience}
      departmentId={announcementState.departmentId}
      departments={model.data?.departments ?? []}
      documentFile={announcementState.documentFile}
      employeePost={announcementState.employeePost}
      existingRoleCode={announcement.existingRoleCode}
      hasExistingVideo={announcement.hasExistingVideo}
      expiresAt={announcementState.expiresAt}
      imageFile={announcementState.imageFile}
      isEditing={Boolean(announcementState.editId)}
      locationId={announcementState.locationId}
      publishAt={announcementState.publishAt}
      roleCode={announcementState.roleCode}
      title={announcementState.title}
      videoMode={announcementState.videoMode}
      videoLink={announcementState.videoLink}
      videoFile={announcementState.videoFile}
      videoProgress={announcement.videoProgress}
      onBodyChange={(value) => announcement.setField('body', value)}
      onCancelEdit={onCancel}
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
      onVideoChange={(values) => {
        if (values.videoMode !== undefined) announcement.setField('videoMode', values.videoMode);
        if (values.videoLink !== undefined) announcement.setField('videoLink', values.videoLink);
        if (values.videoFile !== undefined) announcement.setField('videoFile', values.videoFile);
      }}
      onCancelVideoUpload={announcement.cancelVideoUpload}
    />
  );
};

export const AnnouncementWorkspace = ({ model, tab }: WorkspaceProps) => {
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const { announcement } = model;
  const announcementState = announcement.state;
  const announcementAction = announcementState.editId
    ? 'Continue editing announcement'
    : 'Create Announcement';
  return (
    <PageTabPanel id="announcements" activeTab={tab}>
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          disabled={model.loading || model.busy}
          onClick={() => setAnnouncementOpen((open) => !open)}
        >
          {announcementOpen ? 'Back to announcements' : announcementAction}
        </Button>
      </div>
      <div hidden={!announcementOpen}>
        <Card title={announcementState.editId ? 'Edit announcement' : 'New announcement (HR)'}>
          {model.loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <AdminAnnouncementEditor
              model={model}
              onCancel={() => {
                announcement.cancelEdit();
                setAnnouncementOpen(false);
              }}
            />
          )}
        </Card>
      </div>
      <div hidden={announcementOpen}>
        <AnnouncementHistory
          announcements={model.data?.adminAnnouncements ?? []}
          busy={model.busy}
          onEdit={(id) => {
            announcement.startEdit(id);
            setAnnouncementOpen(true);
          }}
          onDelete={(id) => void model.removeAnnouncement(id)}
        />
      </div>
    </PageTabPanel>
  );
};

export const DirectNotificationWorkspace = ({ model, tab }: WorkspaceProps) => {
  const [directOpen, setDirectOpen] = useState(false);
  const { directNotification } = model;
  const directState = directNotification.state;
  return (
    <PageTabPanel id="direct" activeTab={tab}>
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          disabled={model.loading || model.busy}
          onClick={() => setDirectOpen((open) => !open)}
        >
          {directOpen ? 'Back to sent notifications' : 'Send Notification'}
        </Button>
      </div>
      {directOpen ? (
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
      ) : (
        <NotificationHistory
          notifications={model.data?.adminNotifications ?? []}
          busy={model.busy}
          onDelete={(id) => void model.removeInAppNotification(id)}
        />
      )}
    </PageTabPanel>
  );
};
