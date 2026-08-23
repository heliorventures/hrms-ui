import type { FormEvent } from 'react';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

interface DepartmentOption {
  id: string;
  name: string;
}

interface AnnouncementEditorFormProps {
  body: string;
  busy: boolean;
  clearRoleAudience: boolean;
  departmentId: string;
  departments: DepartmentOption[];
  documentFile: File | null;
  employeePost: boolean;
  existingRoleCode: string;
  expiresAt: string;
  imageFile: File | null;
  isEditing: boolean;
  locationId: string;
  publishAt: string;
  roleCode: string;
  title: string;
  onBodyChange: (value: string) => void;
  onCancelEdit: () => void;
  onClearRoleAudienceChange: (value: boolean) => void;
  onDepartmentChange: (value: string) => void;
  onDocumentChange: (file: File | null) => void;
  onEmployeePostChange: (value: boolean) => void;
  onExpiresAtChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onLocationChange: (value: string) => void;
  onPublishAtChange: (value: string) => void;
  onRoleCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (value: string) => void;
}

const EditorIdentityFields = ({ model }: { model: AnnouncementEditorFormProps }) => (
  <>
    <Input
      label="Title"
      name="announcementTitle"
      autoComplete="off"
      value={model.title}
      onChange={(event) => model.onTitleChange(event.target.value)}
      required
      fullWidth
    />
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Body</span>
      <textarea
        name="announcementBody"
        autoComplete="off"
        value={model.body}
        onChange={(event) => model.onBodyChange(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </label>
    {!model.isEditing ? (
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          name="employeePost"
          type="checkbox"
          checked={model.employeePost}
          onChange={(event) => model.onEmployeePostChange(event.target.checked)}
          className="rounded border-gray-300"
        />
        Employee-style post (unchecked = company announcement)
      </label>
    ) : null}
  </>
);

const EditorAudienceFields = ({ model }: { model: AnnouncementEditorFormProps }) => (
  <>
    <label className="block">
      <span className="mb-1 block text-sm font-medium">Department</span>
      <select
        name="targetDepartmentId"
        autoComplete="off"
        value={model.departmentId}
        onChange={(event) => model.onDepartmentChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">All departments</option>
        {model.departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
    </label>
    <Input
      label="Location ID (Optional UUID)"
      name="targetLocationId"
      autoComplete="off"
      value={model.locationId}
      onChange={(event) => model.onLocationChange(event.target.value)}
      fullWidth
    />
    <Input
      label="Target Role Code"
      name="targetRoleCode"
      autoComplete="off"
      spellCheck={false}
      value={model.roleCode}
      onChange={(event) => model.onRoleCodeChange(event.target.value)}
      disabled={model.clearRoleAudience}
      fullWidth
    />
    <RoleAudienceClearControl model={model} />
  </>
);

const RoleAudienceClearControl = ({ model }: { model: AnnouncementEditorFormProps }) => {
  if (!model.isEditing || !model.existingRoleCode) return null;
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm font-medium text-status-danger">
        <input
          name="clearRoleAudience"
          type="checkbox"
          checked={model.clearRoleAudience}
          onChange={(event) => model.onClearRoleAudienceChange(event.target.checked)}
          disabled={model.busy}
          aria-describedby={model.clearRoleAudience ? 'announcement-role-clear-warning' : undefined}
          className="rounded border-gray-300"
        />
        Clear role targeting
      </label>
      {model.clearRoleAudience ? (
        <p id="announcement-role-clear-warning" className="text-sm text-status-danger">
          Clearing role targeting can expand who receives this announcement. Review the remaining
          audience before updating.
        </p>
      ) : null}
    </div>
  );
};

const EditorScheduleFields = ({ model }: { model: AnnouncementEditorFormProps }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <label className="block">
      <span className="mb-1 block text-sm font-medium">Publish at</span>
      <input
        name="publishAt"
        type="datetime-local"
        autoComplete="off"
        value={model.publishAt}
        onChange={(event) => model.onPublishAtChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </label>
    <label className="block">
      <span className="mb-1 block text-sm font-medium">Expires at</span>
      <input
        name="expiresAt"
        type="datetime-local"
        autoComplete="off"
        value={model.expiresAt}
        onChange={(event) => model.onExpiresAtChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </label>
  </div>
);

const EditorAttachmentFields = ({ model }: { model: AnnouncementEditorFormProps }) => (
  <>
    <label className="block">
      <span className="text-sm font-medium">Image</span>
      <input
        name="announcementImage"
        type="file"
        accept="image/*"
        onChange={(event) => model.onImageChange(event.target.files?.[0] ?? null)}
        className="mt-1 block w-full text-sm"
      />
    </label>
    <label className="block">
      <span className="text-sm font-medium">Document</span>
      <input
        name="announcementDocument"
        type="file"
        onChange={(event) => model.onDocumentChange(event.target.files?.[0] ?? null)}
        className="mt-1 block w-full text-sm"
      />
    </label>
  </>
);

const submitLabel = (busy: boolean, isEditing: boolean): string => {
  if (busy) return 'Saving...';
  if (isEditing) return 'Update Announcement';
  return 'Create Announcement';
};

const AnnouncementEditorForm = (model: AnnouncementEditorFormProps) => (
  <form onSubmit={model.onSubmit} className="space-y-3">
    {model.isEditing ? (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={model.onCancelEdit}
          disabled={model.busy}
        >
          Cancel edit
        </Button>
      </div>
    ) : null}
    <EditorIdentityFields model={model} />
    <EditorAudienceFields model={model} />
    <EditorScheduleFields model={model} />
    <EditorAttachmentFields model={model} />
    <Button type="submit" variant="primary" disabled={model.busy}>
      {submitLabel(model.busy, model.isEditing)}
    </Button>
  </form>
);

export default AnnouncementEditorForm;
