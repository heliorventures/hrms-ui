import {
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type SetStateAction,
} from 'react';

import { FeedbackContext, type FeedbackVariant } from '../notifications/feedbackContext';

/** Keep validation/control state intact while replaying identical action messages. */
type FeedbackSetter<T> = (next: SetStateAction<T>, variantOverride?: FeedbackVariant) => void;

export const useFeedbackState = <T>(
  initialState: T | (() => T),
  variant: FeedbackVariant | ((message: string) => FeedbackVariant)
): [T, FeedbackSetter<T>] => {
  const [value, setValue] = useState(initialState);
  const context = useContext(FeedbackContext);
  const key = useId();
  const currentValue = useRef(value);
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    currentValue.current = value;
  }, [value]);

  const setFeedback = useCallback<FeedbackSetter<T>>(
    (next, variantOverride) => {
      if (!mounted.current || (context && !context.isCurrent())) return;
      const resolved =
        typeof next === 'function' ? (next as (value: T) => T)(currentValue.current) : next;
      currentValue.current = resolved;
      setValue(resolved);
      if (typeof resolved === 'string' && resolved.trim()) {
        const selectedVariant =
          variantOverride ?? (typeof variant === 'function' ? variant(resolved) : variant);
        context?.publish({ key, variant: selectedVariant, content: resolved });
      } else context?.dismiss(key, false);
    },
    [context, key, variant]
  );

  return [value, setFeedback];
};
