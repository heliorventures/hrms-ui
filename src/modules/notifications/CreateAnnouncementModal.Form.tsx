import type { FormEventHandler } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

import type {
  AnnouncementFormState,
  AudienceOptionsState,
  CreateAnnouncementModalController,
} from './CreateAnnouncementModal.types';

interface AudienceFieldsProps {
  audienceOptions: AudienceOptionsState;
  disabled: boolean;
  form: AnnouncementFormState;
}

const FIELD_CLASS_NAME =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white';
const FILE_CLASS_NAME =
  'block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 dark:text-gray-400 dark:file:bg-primary-900/40 dark:file:text-primary-200';

const ScheduleFields = ({ form }: { form: AnnouncementFormState }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <div>
      <label
        htmlFor="announcement-publish-at"
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Publish at
      </label>
      <input
        id="announcement-publish-at"
        type="datetime-local"
        value={form.values.publishAt}
        onChange={(event) => form.setField('publishAt', event.target.value)}
        className={FIELD_CLASS_NAME}
      />
    </div>
    <div>
      <label
        htmlFor="announcement-expires-at"
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Expires at
      </label>
      <input
        id="announcement-expires-at"
        type="datetime-local"
        value={form.values.expiresAt}
        onChange={(event) => form.setField('expiresAt', event.target.value)}
        className={FIELD_CLASS_NAME}
      />
    </div>
  </div>
);

const AudienceFields = ({ audienceOptions, disabled, form }: AudienceFieldsProps) => {
  const roleTargetingActive = form.values.roleCode.trim() !== '';

  return (
    <>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={form.values.employeePost}
          onChange={(event) => form.setField('employeePost', event.target.checked)}
          disabled={disabled}
          className="rounded border-gray-300 text-primary-600 focus-visible:ring-primary-500"
        />
        Employee / team post (uncheck for company-wide HR style)
      </label>
      <div>
        <label
          htmlFor="announcement-department"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Department
        </label>
        <select
          id="announcement-department"
          value={form.values.departmentId}
          onChange={(event) => form.setField('departmentId', event.target.value)}
          disabled={disabled}
          className={`${FIELD_CLASS_NAME} text-gray-900`}
        >
          <option value="">— All departments —</option>
          {audienceOptions.departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Location ID (Optional UUID)"
        type="text"
        value={form.values.locationId}
        onChange={(event) => form.setField('locationId', event.target.value)}
        disabled={disabled}
        fullWidth
      />
      <Input
        label="Target Role Code (Optional, E.G. HR_ADMIN)"
        type="text"
        value={form.values.roleCode}
        onChange={(event) => form.setField('roleCode', event.target.value)}
        disabled={disabled}
        fullWidth
      />
      {roleTargetingActive ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Role-based targeting is set; free-form audience is ignored until role code is cleared.
        </p>
      ) : (
        <Input
          label="Target Audience (Optional)"
          placeholder="e.g. ALL, Engineering"
          type="text"
          value={form.values.targetAudience}
          onChange={(event) => form.setField('targetAudience', event.target.value)}
          disabled={disabled}
          fullWidth
        />
      )}
      <ScheduleFields form={form} />
    </>
  );
};

const AnnouncementFields = ({ form }: { form: AnnouncementFormState }) => (
  <>
    <Input
      label="Title"
      type="text"
      name="title"
      value={form.values.title}
      onChange={(event) => form.setField('title', event.target.value)}
      required
      fullWidth
    />
    <div>
      <label
        htmlFor="announcement-description"
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Description
      </label>
      <textarea
        id="announcement-description"
        name="body"
        value={form.values.body}
        onChange={(event) => form.setField('body', event.target.value)}
        rows={4}
        className={`${FIELD_CLASS_NAME} text-gray-900 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`}
      />
    </div>
  </>
);

const AttachmentFields = ({ form }: { form: AnnouncementFormState }) => (
  <>
    <div>
      <label
        htmlFor="announcement-image"
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Image
      </label>
      <input
        id="announcement-image"
        type="file"
        accept="image/*"
        onChange={(event) => form.setField('imageFile', event.target.files?.[0] ?? null)}
        className={FILE_CLASS_NAME}
      />
    </div>
    <div>
      <label
        htmlFor="announcement-document"
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Document
      </label>
      <input
        id="announcement-document"
        type="file"
        onChange={(event) => form.setField('documentFile', event.target.files?.[0] ?? null)}
        className={FILE_CLASS_NAME}
      />
    </div>
  </>
);

const SubmitLabel = ({ hrCompose, submitting }: { hrCompose: boolean; submitting: boolean }) => {
  if (submitting) return <>Publishing...</>;
  if (hrCompose) return <>Publish Announcement</>;
  return <>Publish Team Post</>;
};

const AudienceLoadError = ({
  audienceOptions,
  retry,
}: {
  audienceOptions: Extract<AudienceOptionsState, { phase: 'failed' }>;
  retry: () => Promise<void>;
}) => (
  <div role="alert" className="space-y-1 text-sm text-red-600 dark:text-red-400">
    <p>Audience options could not be loaded. Your announcement has not been published.</p>
    <p>{audienceOptions.message}</p>
    <Button type="button" variant="outline" size="sm" onClick={() => void retry()}>
      Retry
    </Button>
  </div>
);

export const CreateAnnouncementModalForm = ({
  controller,
}: {
  controller: CreateAnnouncementModalController;
}) => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void controller.submit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {controller.submitError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {controller.submitError}
        </p>
      ) : null}
      {controller.hrCompose && controller.audienceOptions.phase === 'failed' ? (
        <AudienceLoadError
          audienceOptions={controller.audienceOptions}
          retry={controller.loadAudienceOptions}
        />
      ) : null}
      {!controller.hrCompose ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Team posts are shared on the public announcement feed without HR-only targeting.
        </p>
      ) : null}

      <AnnouncementFields form={controller.form} />
      {controller.hrCompose ? (
        <AudienceFields
          audienceOptions={controller.audienceOptions}
          disabled={controller.hrAudienceControlsDisabled}
          form={controller.form}
        />
      ) : null}
      <AttachmentFields form={controller.form} />

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={controller.close}
          disabled={controller.submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={controller.submitting || controller.hrAudienceControlsDisabled}
        >
          <SubmitLabel hrCompose={controller.hrCompose} submitting={controller.submitting} />
        </Button>
      </div>
    </form>
  );
};
