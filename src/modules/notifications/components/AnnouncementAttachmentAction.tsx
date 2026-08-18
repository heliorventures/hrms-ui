import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnnouncementAttachmentDocument,
  type AnnouncementAttachmentQuery,
} from '../../../api/graphql/graphql';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  announcementImageObjectUrl,
  downloadAnnouncementAttachment,
  type AnnouncementAttachmentKind,
} from '../announcementAttachment';

interface AnnouncementAttachmentActionProps {
  announcementId: string;
  available: boolean;
  kind: AnnouncementAttachmentKind;
  compact?: boolean;
}

const AnnouncementAttachmentAction = ({
  announcementId,
  available,
  kind,
  compact = false,
}: AnnouncementAttachmentActionProps) => {
  const client = useGraphClient('client');
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const imageUrlRef = useRef<string | null>(null);
  const imageSourceRef = useRef<{ announcementId: string; kind: AnnouncementAttachmentKind } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const revokeImageUrl = useCallback(() => {
    if (!imageUrlRef.current) return;
    URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = null;
    imageSourceRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      revokeImageUrl();
    };
  }, [revokeImageUrl]);

  useEffect(() => {
    const imageBelongsToCurrentAttachment =
      imageSourceRef.current?.announcementId === announcementId &&
      imageSourceRef.current?.kind === kind;
    if (imageUrlRef.current && (!available || kind !== 'IMAGE' || !imageBelongsToCurrentAttachment)) {
      revokeImageUrl();
      setImageUrl(null);
    }
    setError(null);
  }, [announcementId, available, kind, revokeImageUrl]);

  if (!available) return null;

  const loadAttachment = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const result = await client.request<AnnouncementAttachmentQuery>(
        AnnouncementAttachmentDocument,
        { announcementId, kind }
      );
      if (!mountedRef.current) return;
      if (kind === 'IMAGE') {
        const nextImageUrl = announcementImageObjectUrl(result.announcementAttachment);
        revokeImageUrl();
        imageUrlRef.current = nextImageUrl;
        imageSourceRef.current = nextImageUrl ? { announcementId, kind } : null;
        setImageUrl(nextImageUrl);
      } else {
        downloadAnnouncementAttachment(result.announcementAttachment);
      }
    } catch (cause) {
      if (mountedRef.current) setError(graphQlUserMessage(cause));
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  };

  const currentImageUrl =
    imageSourceRef.current?.announcementId === announcementId && imageSourceRef.current?.kind === kind
      ? imageUrl
      : null;

  return (
    <div className={compact ? 'mt-2' : 'mt-3'}>
      {currentImageUrl ? (
        <img
          src={currentImageUrl}
          alt="Announcement attachment"
          className={
            compact
              ? 'max-h-32 max-w-full rounded border border-gray-200 object-contain dark:border-gray-600'
              : 'max-h-48 max-w-full rounded-md border border-gray-200 object-contain dark:border-gray-600'
          }
        />
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => void loadAttachment()}
          className={`${compact ? 'text-xs' : 'text-sm'} text-primary-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-wait disabled:opacity-60 dark:text-primary-400`}
        >
          {loading
            ? 'Loading attachment...'
            : kind === 'IMAGE'
              ? 'View image attachment'
              : 'Download attachment'}
        </button>
      )}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default AnnouncementAttachmentAction;
