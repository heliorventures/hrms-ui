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
  departmentId: string;
  departments: DepartmentOption[];
  documentFile: File | null;
  employeePost: boolean;
  expiresAt: string;
  imageFile: File | null;
  isEditing: boolean;
  locationId: string;
  publishAt: string;
  roleCode: string;
  title: string;
  onBodyChange: (value: string) => void;
  onCancelEdit: () => void;
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

const AnnouncementEditorForm = ({
  body,
  busy,
  departmentId,
  departments,
  employeePost,
  expiresAt,
  isEditing,
  locationId,
  publishAt,
  roleCode,
  title,
  onBodyChange,
  onCancelEdit,
  onDepartmentChange,
  onDocumentChange,
  onEmployeePostChange,
  onExpiresAtChange,
  onImageChange,
  onLocationChange,
  onPublishAtChange,
  onRoleCodeChange,
  onSubmit,
  onTitleChange,
}: AnnouncementEditorFormProps) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {isEditing && (
        <Button type="button" variant="outline" size="sm" onClick={onCancelEdit} disabled={busy}>
          Cancel edit
        </Button>
      )}
    </div>
    <Input label="Title" value={title} onChange={(e) => onTitleChange(e.target.value)} required fullWidth />
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Body</label>
      <textarea
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
    {!isEditing && (
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={employeePost}
          onChange={(e) => onEmployeePostChange(e.target.checked)}
          className="rounded border-gray-300"
        />
        Employee-style post (unchecked = company announcement)
      </label>
    )}
    <div>
      <label className="mb-1 block text-sm font-medium">Department</label>
      <select
        value={departmentId}
        onChange={(e) => onDepartmentChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">All departments</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
    </div>
    <Input
      label="Location id (optional UUID)"
      value={locationId}
      onChange={(e) => onLocationChange(e.target.value)}
      fullWidth
    />
    <Input
      label="Target role code"
      value={roleCode}
      onChange={(e) => onRoleCodeChange(e.target.value)}
      fullWidth
    />
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium">Publish at</label>
        <input
          type="datetime-local"
          value={publishAt}
          onChange={(e) => onPublishAtChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Expires at</label>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => onExpiresAtChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>
    <div>
      <label className="text-sm font-medium">Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
        className="mt-1 block w-full text-sm"
      />
    </div>
    <div>
      <label className="text-sm font-medium">Document</label>
      <input
        type="file"
        onChange={(e) => onDocumentChange(e.target.files?.[0] ?? null)}
        className="mt-1 block w-full text-sm"
      />
    </div>
    <Button type="submit" variant="primary" disabled={busy}>
      {busy ? 'Saving...' : isEditing ? 'Update announcement' : 'Create announcement'}
    </Button>
  </form>
);

export default AnnouncementEditorForm;
