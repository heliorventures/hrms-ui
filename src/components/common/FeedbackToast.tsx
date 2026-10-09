import { useContext, useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';

import {
  FeedbackContext,
  feedbackIdentity,
  feedbackText,
  type FeedbackVariant,
} from '../../notifications/feedbackContext';
import FeedbackProvider from '../../notifications/FeedbackProvider';

export interface FeedbackToastProps {
  children: ReactNode;
  variant?: FeedbackVariant;
  title?: string;
  action?: ReactNode;
  onDismiss?: () => void;
  focusOnMount?: boolean;
  id?: string;
  messageKey?: unknown;
  eventKey?: unknown;
}

const PublishFeedback = ({
  children,
  variant = 'error',
  eventKey,
  ...options
}: FeedbackToastProps) => {
  const context = useContext(FeedbackContext);
  const key = useId();
  const notification = { key, variant, content: children, ...options };
  const identity = JSON.stringify([
    feedbackIdentity(notification),
    notification.title,
    feedbackText(children),
  ]);
  const latest = useRef({ context, notification });
  latest.current = { context, notification };
  useLayoutEffect(() => {
    const current = latest.current;
    current.context?.refresh(current.notification);
  });
  useEffect(() => {
    const current = latest.current;
    current.context?.publish(current.notification);
    // The host owns expiry. Unmounting a saved form must not erase its result.
  }, [identity, eventKey]);
  return null;
};

const FeedbackToast = ({ action, ...props }: FeedbackToastProps) => {
  const context = useContext(FeedbackContext);
  return (
    <>
      {action ? <div className="my-3 flex flex-wrap items-center gap-2">{action}</div> : null}
      {props.id ? (
        <span id={props.id} className="sr-only">
          {feedbackText(props.children)}
        </span>
      ) : null}
      {context ? (
        <PublishFeedback {...props} />
      ) : (
        <FeedbackProvider scopeKey="standalone">
          <PublishFeedback {...props} />
        </FeedbackProvider>
      )}
    </>
  );
};

export default FeedbackToast;
