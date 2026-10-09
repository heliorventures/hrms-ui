import { Children, createContext, isValidElement, type ReactNode } from 'react';

export type FeedbackVariant = 'error' | 'info' | 'success' | 'warning';

export interface FeedbackNotification {
  key: string;
  variant: FeedbackVariant;
  content: ReactNode;
  title?: string;
  action?: ReactNode;
  onDismiss?: () => void;
  focusOnMount?: boolean;
  messageKey?: unknown;
}

export interface FeedbackEntry extends FeedbackNotification {
  identity: string;
  sourceKeys: string[];
  dismissCallbacks: Record<string, (() => void) | undefined>;
  revision: number;
  scopeKey: string;
  expiresAt: number;
}

export const feedbackText = (content: ReactNode): string =>
  Children.toArray(content)
    .map((child): string => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      if (isValidElement<{ children?: ReactNode }>(child))
        return feedbackText(child.props.children);
      return '';
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

export const feedbackIdentity = (
  notification: Pick<FeedbackNotification, 'variant' | 'content' | 'messageKey'>
) =>
  JSON.stringify([
    typeof notification.messageKey === 'string'
      ? notification.messageKey.trim()
      : feedbackText(notification.content),
  ]);

export const FeedbackContext = createContext<{
  isCurrent: () => boolean;
  publish: (notification: FeedbackNotification) => void;
  refresh: (notification: FeedbackNotification) => void;
  dismiss: (key: string, notifyOwner?: boolean, expectedRevision?: number) => void;
} | null>(null);
