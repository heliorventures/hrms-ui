import { Clipboard, Eye, EyeOff } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { UI_FEEDBACK_TEXT } from '../../constants/uiText';

const REVEAL_UNAVAILABLE_TEXT = 'Unable to reveal this value. Try again.';

export interface SensitiveValueProps {
  label: string;
  value: string;
  resolveValue?: () => string;
  maskedValue: string;
  mayReveal: boolean;
  copyable?: boolean;
  remaskAfterMs?: number;
}

interface RevealedValue {
  sourceValue: string;
  resolveValue?: () => string;
  displayedValue: string;
}

interface SensitiveRevealOptions {
  value: string;
  resolveValue?: () => string;
  mayReveal: boolean;
  copyable: boolean;
  remaskAfterMs: number;
}

const revealMatchesSource = (
  revealed: RevealedValue,
  value: string,
  resolveValue: (() => string) | undefined
) => revealed.sourceValue === value && revealed.resolveValue === resolveValue;

const copySensitiveValueSafely = async (
  displayedValue: string,
  operationIsCurrent: () => boolean,
  setFeedback: (feedback: string) => void
) => {
  try {
    const clipboard = Reflect.get(navigator, 'clipboard') as
      | { writeText?: (text: string) => Promise<void> }
      | undefined;
    if (!clipboard || typeof clipboard.writeText !== 'function') {
      throw new Error('Clipboard unavailable');
    }
    await clipboard.writeText(displayedValue);
    if (operationIsCurrent()) setFeedback(UI_FEEDBACK_TEXT.copied);
  } catch {
    if (operationIsCurrent()) setFeedback(UI_FEEDBACK_TEXT.copyUnavailable);
  }
};

const useSensitiveReveal = ({
  value,
  resolveValue,
  mayReveal,
  copyable,
  remaskAfterMs,
}: SensitiveRevealOptions) => {
  const [revealedValue, setRevealedValue] = useState<RevealedValue | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const timerRef = useRef<number | undefined>();
  const operationGenerationRef = useRef(0);
  const mountedRef = useRef(true);
  const currentValueRef = useRef(value);
  const currentResolverRef = useRef(resolveValue);
  const mayRevealRef = useRef(mayReveal);
  const revealedValueRef = useRef(revealedValue);

  currentValueRef.current = value;
  currentResolverRef.current = resolveValue;
  mayRevealRef.current = mayReveal;
  revealedValueRef.current = revealedValue;

  const clearRemaskTimer = useCallback(() => {
    if (timerRef.current === undefined) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const invalidatePrivateState = useCallback(() => {
    operationGenerationRef.current += 1;
    clearRemaskTimer();
    revealedValueRef.current = null;
    setRevealedValue(null);
    setCopyFeedback(null);
  }, [clearRemaskTimer]);

  useLayoutEffect(() => {
    invalidatePrivateState();
  }, [invalidatePrivateState, mayReveal, resolveValue, value]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      operationGenerationRef.current += 1;
      clearRemaskTimer();
      revealedValueRef.current = null;
    };
  }, [clearRemaskTimer]);

  const isRevealed =
    mayReveal && revealedValue !== null && revealMatchesSource(revealedValue, value, resolveValue);

  const toggleReveal = useCallback(() => {
    if (!mayReveal) return;
    const currentReveal = revealedValueRef.current;
    if (currentReveal && revealMatchesSource(currentReveal, value, resolveValue)) {
      invalidatePrivateState();
      return;
    }

    operationGenerationRef.current += 1;
    clearRemaskTimer();
    revealedValueRef.current = null;
    setRevealedValue(null);
    setCopyFeedback(null);

    let displayedValue: string;
    try {
      displayedValue = resolveValue ? resolveValue() : value;
    } catch {
      setCopyFeedback(REVEAL_UNAVAILABLE_TEXT);
      return;
    }

    const nextRevealedValue = {
      sourceValue: value,
      resolveValue,
      displayedValue,
    };
    revealedValueRef.current = nextRevealedValue;
    setRevealedValue(nextRevealedValue);

    const generation = operationGenerationRef.current;
    timerRef.current = window.setTimeout(
      () => {
        if (
          !mountedRef.current ||
          generation !== operationGenerationRef.current ||
          revealedValueRef.current !== nextRevealedValue ||
          !revealMatchesSource(
            nextRevealedValue,
            currentValueRef.current,
            currentResolverRef.current
          )
        ) {
          return;
        }
        operationGenerationRef.current += 1;
        timerRef.current = undefined;
        revealedValueRef.current = null;
        setRevealedValue(null);
        setCopyFeedback(null);
      },
      Math.max(0, remaskAfterMs)
    );
  }, [clearRemaskTimer, invalidatePrivateState, mayReveal, remaskAfterMs, resolveValue, value]);

  const copyRevealedValue = useCallback(() => {
    const revealed = revealedValueRef.current;
    if (!revealed || !revealMatchesSource(revealed, value, resolveValue) || !mayReveal || !copyable)
      return;

    const generation = operationGenerationRef.current;
    const operationIsCurrent = () =>
      mountedRef.current &&
      generation === operationGenerationRef.current &&
      mayRevealRef.current &&
      currentValueRef.current === revealed.sourceValue &&
      currentResolverRef.current === revealed.resolveValue &&
      revealedValueRef.current === revealed;

    return copySensitiveValueSafely(revealed.displayedValue, operationIsCurrent, setCopyFeedback);
  }, [copyable, mayReveal, resolveValue, value]);

  return {
    copyFeedback,
    copyRevealedValue,
    displayedValue: isRevealed ? revealedValue.displayedValue : null,
    isRevealed,
    toggleReveal,
  };
};

const SensitiveValue = ({
  label,
  value,
  resolveValue,
  maskedValue,
  mayReveal,
  copyable = false,
  remaskAfterMs = 30_000,
}: SensitiveValueProps) => {
  const { copyFeedback, copyRevealedValue, displayedValue, isRevealed, toggleReveal } =
    useSensitiveReveal({ value, resolveValue, mayReveal, copyable, remaskAfterMs });

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span>
        <span className="sr-only">{label}: </span>
        <span className="select-text tabular-nums">{displayedValue ?? maskedValue}</span>
      </span>
      {mayReveal ? (
        <button
          type="button"
          onClick={toggleReveal}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-content-muted hover:bg-surface-selected hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 motion-reduce:transition-none"
          aria-label={`${isRevealed ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
        >
          {isRevealed ? (
            <EyeOff aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Eye aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
      ) : null}
      {isRevealed && copyable ? (
        <button
          type="button"
          onClick={() => {
            void copyRevealedValue();
          }}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-content-muted hover:bg-surface-selected hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 motion-reduce:transition-none"
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          <Clipboard aria-hidden="true" className="h-4 w-4" />
        </button>
      ) : null}
      {copyFeedback ? (
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-xs text-content-secondary"
        >
          {copyFeedback}
        </span>
      ) : null}
    </span>
  );
};

export default SensitiveValue;
