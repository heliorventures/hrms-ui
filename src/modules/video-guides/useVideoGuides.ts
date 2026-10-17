import { useEffect, useState } from 'react';

import { parseVideoGuideCatalog, type VideoGuideCatalog } from './catalog.mjs';

type LibraryState =
  | { phase: 'loading' }
  | { phase: 'ready'; catalog: VideoGuideCatalog }
  | { phase: 'error' };

export const useVideoGuides = () => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LibraryState>({ phase: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ phase: 'loading' });
    const load = async () => {
      try {
        const response = await fetch('/video-guides/catalog.json', {
          signal: controller.signal,
          cache: 'no-store',
          credentials: 'omit',
        });
        if (!response.ok) throw new Error('Library unavailable');
        const value: unknown = await response.json();
        const catalog = parseVideoGuideCatalog(value);
        if (!controller.signal.aborted) setState({ phase: 'ready', catalog });
      } catch {
        if (!controller.signal.aborted) setState({ phase: 'error' });
      }
    };
    void load();
    return () => controller.abort();
  }, [attempt]);

  return { state, reload: () => setAttempt((value) => value + 1) };
};
