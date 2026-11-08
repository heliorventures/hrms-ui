import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { subscribeOverlays, topOverlay } from '../components/common/overlayStack';

import type { FeedbackEntry } from './feedbackContext';
import FeedbackToastItem from './FeedbackToastItem';

const overlaySurface = () => topOverlay()?.surface() ?? null;
const serverSurface = () => null;

const FeedbackToastHost = ({
  entries,
  onDismiss,
}: {
  entries: FeedbackEntry[];
  onDismiss: (key: string, notifyOwner?: boolean, expectedRevision?: number) => void;
}) => {
  const surface = useSyncExternalStore(subscribeOverlays, overlaySurface, serverSurface);
  if (typeof document === 'undefined' || entries.length === 0) return null;
  return createPortal(
    <div
      data-feedback-toast-host
      className="pointer-events-none fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-[100] flex max-h-[50dvh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2 overflow-y-auto p-1"
    >
      {entries.map((entry) => (
        <FeedbackToastItem key={entry.key} entry={entry} onDismiss={onDismiss} />
      ))}
    </div>,
    surface ?? document.body
  );
};

export default FeedbackToastHost;
