import { useCallback, useContext, useId, useLayoutEffect, useRef } from 'react';

import { UI_FEEDBACK_TEXT } from '../constants/uiText';
import { FeedbackContext } from '../notifications/feedbackContext';

type ActionOutcome = 'saved' | 'created' | 'updated' | 'removed' | 'submitted';

/** Notify after successful responses and ownership checks, before closing the form. */
export const useActionFeedback = () => {
  const context = useContext(FeedbackContext);
  const key = useId();
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return useCallback(
    (outcome: ActionOutcome = 'saved', message?: string) => {
      if (mounted.current)
        context?.publish({
          key,
          variant: 'success',
          content: message ?? UI_FEEDBACK_TEXT[outcome],
        });
    },
    [context, key]
  );
};
