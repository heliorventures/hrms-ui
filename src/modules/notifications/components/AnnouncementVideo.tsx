import { useEffect, useRef, useState } from 'react';

import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { safeVideoLink } from '../announcementVideoUpload';
import { useNotificationOwnerKey } from '../useNotificationOwnerKey';
import { AnnouncementVideoDocument, type VideoPlayback } from '../videoDocuments';

const VideoPlayer = ({ announcementId }: { announcementId: string }) => {
  const client = useGraphClient('client');
  const currentClient = useRef(client);
  currentClient.current = client;
  const generation = useRef(0);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [media, setMedia] = useState<{ client: typeof client; value: VideoPlayback } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(
    () => () => {
      generation.current += 1;
    },
    []
  );
  const load = async () => {
    if (busyRef.current) return;
    const request = ++generation.current;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    setMedia(null);
    try {
      const result = await client.request<{ announcementVideo: VideoPlayback }>(
        AnnouncementVideoDocument,
        { announcementId }
      );
      if (request !== generation.current || currentClient.current !== client) return;
      if (!safeVideoLink(result.announcementVideo.playbackUrl))
        throw new Error('The playback address is unavailable. Please retry.');
      setMedia({ client, value: result.announcementVideo });
    } catch (failure) {
      if (request === generation.current && currentClient.current === client)
        setError(graphQlUserMessage(failure));
    } finally {
      if (request === generation.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };
  const visible = media?.client === client ? media.value : null;
  return (
    <div className="mt-3 space-y-2">
      {visible && !error ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- Uploaded media may contain embedded tracks; this contract does not supply separate caption files.
        <video
          key={visible.playbackUrl}
          src={visible.playbackUrl}
          controls
          playsInline
          preload="metadata"
          aria-label={visible.fileName || 'Announcement video'}
          className="max-h-96 w-full max-w-2xl rounded-lg bg-black"
          onError={() =>
            setError(
              'The video could not play. Retry to renew access, or check that your browser supports this video format.'
            )
          }
        >
          Your browser does not support video playback.
        </video>
      ) : (
        <Button
          size="sm"
          variant="outline"
          busy={busy}
          busyLabel="Loading video…"
          onClick={() => {
            void load();
          }}
        >
          {error ? 'Retry video' : 'Play video'}
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-status-danger">
          {error}
        </p>
      )}
    </div>
  );
};

const AnnouncementVideo = ({
  announcementId,
  available,
  link,
}: {
  announcementId: string;
  available?: boolean;
  link?: string | null;
}) => {
  const owner = useNotificationOwnerKey();
  const safeLink = link ? safeVideoLink(link) : null;
  if (safeLink)
    return (
      <a
        className="mt-3 inline-flex text-sm font-medium text-primary-600 underline"
        href={safeLink}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
      >
        Open video in a new tab
      </a>
    );
  return available ? (
    <VideoPlayer key={`${owner}|${announcementId}`} announcementId={announcementId} />
  ) : null;
};

export default AnnouncementVideo;
