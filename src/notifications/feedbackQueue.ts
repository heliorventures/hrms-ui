import { feedbackIdentity, type FeedbackEntry, type FeedbackNotification } from './feedbackContext';

const detachSource = (entry: FeedbackEntry, source: string): FeedbackEntry[] => {
  const sourceKeys = entry.sourceKeys.filter((key) => key !== source);
  if (!sourceKeys.length) return [];
  const dismissCallbacks = Object.fromEntries(
    Object.entries(entry.dismissCallbacks).filter(([key]) => sourceKeys.includes(key))
  );
  return [{ ...entry, sourceKeys, dismissCallbacks }];
};

export const mergeFeedback = (
  current: FeedbackEntry[],
  entry: FeedbackEntry,
  source: string
): FeedbackEntry[] => {
  const existing = current.find(
    (item) => item.scopeKey === entry.scopeKey && item.identity === entry.identity
  );
  const next = existing
    ? {
        ...entry,
        key: existing.key,
        sourceKeys: [...new Set([...existing.sourceKeys, ...entry.sourceKeys])],
        dismissCallbacks: { ...existing.dismissCallbacks, ...entry.dismissCallbacks },
        variant: entry.variant === 'info' ? existing.variant : entry.variant,
        action: entry.action ?? existing.action,
        title: entry.title ?? existing.title,
      }
    : entry;
  const retained = current.flatMap((item) => {
    if (item.scopeKey !== entry.scopeKey || item === existing) return [];
    return detachSource(item, source);
  });
  return [...retained, next];
};

export const removeFeedback = (
  current: FeedbackEntry[],
  key: string,
  detachOwner: boolean,
  expectedRevision?: number
): FeedbackEntry[] =>
  current.flatMap((item) => {
    if (item.key !== key && !item.sourceKeys.includes(key)) return [item];
    if (expectedRevision !== undefined && item.revision !== expectedRevision) return [item];
    return detachOwner ? detachSource(item, key) : [];
  });

export const refreshFeedback = (
  current: FeedbackEntry[],
  notification: FeedbackNotification,
  scopeKey: string
): FeedbackEntry[] => {
  const identity = feedbackIdentity(notification);
  const index = current.findIndex(
    (item) =>
      item.sourceKeys.includes(notification.key) &&
      item.scopeKey === scopeKey &&
      item.identity === identity
  );
  if (index === -1) return current;
  return current.map((item, itemIndex) =>
    itemIndex === index
      ? {
          ...item,
          ...notification,
          key: item.key,
          dismissCallbacks: {
            ...item.dismissCallbacks,
            [notification.key]: notification.onDismiss,
          },
          variant: notification.variant === 'info' ? item.variant : notification.variant,
        }
      : item
  );
};
