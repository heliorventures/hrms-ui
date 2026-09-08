import type { GraphQLClient } from 'graphql-request';
import { useCallback, useEffect, useRef, useState } from 'react';

import { uploadAnnouncementVideo } from './announcementVideoUpload';

export function useAnnouncementVideoUpload(client: GraphQLClient) {
  const active = useRef<AbortController | null>(null);
  const cache = useRef<{ file: File; stageId: string; expiresAt: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const cancelUpload = useCallback(() => active.current?.abort(), []);
  useEffect(
    () => () => {
      active.current?.abort();
      cache.current = null;
    },
    [client]
  );
  const resetVideo = useCallback(() => {
    active.current?.abort();
    cache.current = null;
    setProgress(null);
  }, []);
  const prepareVideo = useCallback(
    async (file: File | null): Promise<string | null> => {
      if (!file) return null;
      if (cache.current?.file === file && Date.parse(cache.current.expiresAt) > Date.now())
        return cache.current.stageId;
      const controller = new AbortController();
      active.current?.abort();
      active.current = controller;
      setProgress(0);
      try {
        const stage = await uploadAnnouncementVideo(
          client,
          file,
          (value) => {
            if (active.current === controller && !controller.signal.aborted) setProgress(value);
          },
          controller.signal
        );
        if (controller.signal.aborted)
          throw new DOMException('Video upload cancelled.', 'AbortError');
        cache.current = { file, ...stage };
        return stage.stageId;
      } finally {
        if (active.current === controller) {
          active.current = null;
          setProgress(null);
        }
      }
    },
    [client]
  );
  return { prepareVideo, resetVideo, cancelUpload, progress };
}
