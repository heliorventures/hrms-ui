import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { FLASH_TOAST_DURATION_MS } from '../hooks/useFlashToast';

import {
  FeedbackContext,
  feedbackIdentity,
  type FeedbackEntry,
  type FeedbackNotification,
} from './feedbackContext';
import { mergeFeedback, removeFeedback, refreshFeedback } from './feedbackQueue';
import FeedbackToastHost from './FeedbackToastHost';

const FeedbackProvider = ({ children, scopeKey }: { children: ReactNode; scopeKey: string }) => {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const entriesRef = useRef(entries);
  const scopeRef = useRef(scopeKey);
  const mounted = useRef(true);
  const revision = useRef(0);
  const scopeGeneration = useRef(0);
  if (scopeRef.current !== scopeKey) scopeGeneration.current += 1;
  const generation = scopeGeneration.current;
  scopeRef.current = scopeKey;
  entriesRef.current = entries;

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    setEntries((current) => current.filter((entry) => entry.scopeKey === scopeKey));
  }, [scopeKey]);

  const isCurrent = useCallback(
    () => mounted.current && scopeGeneration.current === generation,
    [generation]
  );

  const publish = useCallback(
    (notification: FeedbackNotification) => {
      if (!isCurrent()) return;
      const identity = feedbackIdentity(notification);
      const entry: FeedbackEntry = {
        ...notification,
        key: `feedback-${revision.current + 1}`,
        identity,
        scopeKey,
        sourceKeys: [notification.key],
        dismissCallbacks: { [notification.key]: notification.onDismiss },
        revision: ++revision.current,
        expiresAt: Date.now() + FLASH_TOAST_DURATION_MS,
      };
      setEntries((current) => mergeFeedback(current, entry, notification.key));
    },
    [scopeKey, isCurrent]
  );

  const dismiss = useCallback(
    (key: string, notifyOwner = true, expectedRevision?: number) => {
      if (!isCurrent()) return;
      const entry = entriesRef.current.find(
        (item) => item.key === key || item.sourceKeys.includes(key)
      );
      setEntries((current) =>
        removeFeedback(
          current,
          key,
          !notifyOwner && expectedRevision === undefined,
          expectedRevision
        )
      );
      if (notifyOwner && (expectedRevision === undefined || entry?.revision === expectedRevision)) {
        for (const callback of new Set(Object.values(entry?.dismissCallbacks ?? {}))) callback?.();
      }
    },
    [isCurrent]
  );

  const refresh = useCallback(
    (notification: FeedbackNotification) => {
      if (!isCurrent()) return;
      setEntries((current) => refreshFeedback(current, notification, scopeKey));
    },
    [scopeKey, isCurrent]
  );

  const context = useMemo(
    () => ({ publish, refresh, dismiss, isCurrent }),
    [publish, refresh, dismiss, isCurrent]
  );
  return (
    <FeedbackContext.Provider value={context}>
      {children}
      <FeedbackToastHost
        entries={entries.filter((entry) => entry.scopeKey === scopeKey)}
        onDismiss={dismiss}
      />
    </FeedbackContext.Provider>
  );
};

export default FeedbackProvider;
