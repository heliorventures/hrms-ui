import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { OrgDepartmentsDocument, type OrgDepartmentsQuery } from '../../api/graphql/graphql';
import { canManageNotifications } from '../../auth/navAccess';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { publishAnnouncement } from './announcementSubmission';
import { announcementVideoError, safeVideoLink } from './announcementVideoUpload';
import type {
  AnnouncementFormState,
  AnnouncementFormValues,
  AudienceOptionsState,
  CreateAnnouncementModalController,
  CreateAnnouncementModalProps,
} from './CreateAnnouncementModal.types';
import { useAnnouncementVideoUpload } from './useAnnouncementVideoUpload';

const MAX_ANNOUNCEMENT_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_ANNOUNCEMENT_DOCUMENT_BYTES = 6 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

interface ValidatedSchedule {
  publishAt: string | null;
  expiresAt: string | null;
}

type ValidationResult =
  | { valid: true; schedule: ValidatedSchedule }
  | { valid: false; message: string };

const createInitialForm = (): AnnouncementFormValues => ({
  title: '',
  body: '',
  targetAudience: '',
  employeePost: true,
  departmentId: '',
  locationId: '',
  roleCode: '',
  publishAt: '',
  expiresAt: '',
  imageFile: null,
  documentFile: null,
  videoMode: 'NONE',
  videoLink: '',
  videoFile: null,
});

const parseOptionalDateTime = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const validateFile = (
  file: File | null,
  allowedTypes: ReadonlySet<string>,
  maxBytes: number,
  label: string
) => {
  if (!file) return null;
  if (file.size > maxBytes) {
    return `${label} must be ${Math.floor(maxBytes / (1024 * 1024))} MB or smaller.`;
  }
  if (!allowedTypes.has(file.type)) return `${label} file type is not allowed.`;
  return null;
};

const validateSchedule = (values: AnnouncementFormValues, hrCompose: boolean): ValidationResult => {
  const publishAt = hrCompose ? parseOptionalDateTime(values.publishAt) : null;
  const expiresAt = hrCompose ? parseOptionalDateTime(values.expiresAt) : null;
  if (publishAt === undefined || expiresAt === undefined) {
    return {
      valid: false,
      message: 'Publish and expiry dates must be valid date/time values.',
    };
  }
  if (publishAt && expiresAt && expiresAt <= publishAt) {
    return { valid: false, message: 'Expiry date must be after publish date.' };
  }

  return { valid: true, schedule: { publishAt, expiresAt } };
};

const validateAttachments = (values: AnnouncementFormValues) => {
  if (values.videoMode === 'LINK' && !safeVideoLink(values.videoLink))
    return 'Enter a valid http or https video link.';
  if (values.videoMode === 'UPLOAD') {
    if (!values.videoFile) return 'Choose a video file.';
    const videoError = announcementVideoError(values.videoFile);
    if (videoError) return videoError;
  }
  const imageError = validateFile(
    values.imageFile,
    ALLOWED_IMAGE_TYPES,
    MAX_ANNOUNCEMENT_IMAGE_BYTES,
    'Announcement image'
  );
  if (imageError) return imageError;

  const documentError = validateFile(
    values.documentFile,
    ALLOWED_DOCUMENT_TYPES,
    MAX_ANNOUNCEMENT_DOCUMENT_BYTES,
    'Announcement document'
  );
  return documentError;
};

const validateSubmission = (
  values: AnnouncementFormValues,
  hrCompose: boolean
): ValidationResult => {
  if (!values.title.trim()) return { valid: false, message: 'Title is required.' };

  const schedule = validateSchedule(values, hrCompose);
  if (!schedule.valid) return schedule;

  const attachmentError = validateAttachments(values);
  if (attachmentError) return { valid: false, message: attachmentError };

  return schedule;
};

const useAnnouncementForm = (): AnnouncementFormState => {
  const [values, setValues] = useState<AnnouncementFormValues>(createInitialForm);
  const setField: AnnouncementFormState['setField'] = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);
  const reset = useCallback(() => setValues(createInitialForm()), []);
  return { values, setValues, setField, reset };
};

const useAudienceOptions = (enabled: boolean) => {
  const client = useGraphClient('client');
  const requestSequence = useRef(0);
  const [audienceOptions, setAudienceOptions] = useState<AudienceOptionsState>({
    phase: 'loading',
    departments: [],
  });

  const invalidate = useCallback(() => {
    requestSequence.current += 1;
    setAudienceOptions({ phase: 'loading', departments: [] });
  }, []);

  const load = useCallback(async () => {
    const requestId = ++requestSequence.current;
    setAudienceOptions({ phase: 'loading', departments: [] });
    try {
      const result = await client.request<OrgDepartmentsQuery>(OrgDepartmentsDocument, {
        limit: 100,
      });
      if (requestId === requestSequence.current) {
        setAudienceOptions({ phase: 'loaded', departments: result.departments });
      }
    } catch (error) {
      if (requestId === requestSequence.current) {
        setAudienceOptions({
          phase: 'failed',
          departments: [],
          message: graphQlUserMessage(error),
        });
      }
    }
  }, [client]);

  useEffect(() => {
    if (!enabled) return;
    void load();
    return () => {
      requestSequence.current += 1;
    };
  }, [enabled, load]);

  useLayoutEffect(() => {
    if (!enabled) invalidate();
  }, [enabled, invalidate]);

  return { audienceOptions, invalidate, load };
};

export const useCreateAnnouncementModalController = ({
  isOpen,
  onClose,
  onCreated,
}: CreateAnnouncementModalProps): CreateAnnouncementModalController => {
  const client = useGraphClient('client');
  const { can, clientSession } = useAuth();
  const navOptions = useMemo(() => ({ can, clientSession }), [can, clientSession]);
  const hrCompose = canManageNotifications(navOptions);
  const form = useAnnouncementForm();
  const audience = useAudienceOptions(isOpen && hrCompose);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const busyRef = useRef(false);
  const alive = useRef(true);
  const currentClient = useRef(client);
  currentClient.current = client;
  const video = useAnnouncementVideoUpload(client);
  const { resetVideo } = video;
  const isCurrent = useCallback(() => alive.current && currentClient.current === client, [client]);
  const ensureCurrent = useCallback(() => {
    if (!isCurrent()) throw new DOMException('Submission cancelled.', 'AbortError');
  }, [isCurrent]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    busyRef.current = false;
    setSubmitting(false);
    setSubmitError(null);
    resetVideo();
  }, [client, resetVideo]);

  const close = useCallback(() => {
    if (submitting) return;
    audience.invalidate();
    form.reset();
    video.resetVideo();
    setSubmitError(null);
    onClose();
  }, [audience, form, onClose, submitting, video]);

  const submit = useCallback(async () => {
    if (busyRef.current) return;
    setSubmitError(null);
    if (hrCompose && audience.audienceOptions.phase !== 'loaded') return;

    const validation = validateSubmission(form.values, hrCompose);
    if (!validation.valid) {
      setSubmitError(validation.message);
      return;
    }

    busyRef.current = true;
    setSubmitting(true);
    try {
      await publishAnnouncement({
        client,
        values: form.values,
        hrCompose,
        schedule: validation.schedule,
        prepareVideo: video.prepareVideo,
        ensureCurrent,
      });
      onCreated?.();
      form.reset();
      video.resetVideo();
      onClose();
    } catch (error) {
      if (isCurrent())
        setSubmitError(
          error instanceof DOMException && error.name === 'AbortError'
            ? 'Video upload cancelled. You can choose another file or retry.'
            : graphQlUserMessage(error)
        );
    } finally {
      if (isCurrent()) {
        busyRef.current = false;
        setSubmitting(false);
      }
    }
  }, [
    audience.audienceOptions.phase,
    client,
    form,
    hrCompose,
    onClose,
    onCreated,
    video,
    ensureCurrent,
    isCurrent,
  ]);

  return {
    audienceOptions: audience.audienceOptions,
    close,
    form,
    hrAudienceControlsDisabled: hrCompose && audience.audienceOptions.phase !== 'loaded',
    hrCompose,
    loadAudienceOptions: audience.load,
    submit,
    submitError,
    submitting,
    videoProgress: video.progress,
    cancelVideoUpload: video.cancelUpload,
  };
};
