import { useId, type CSSProperties, type RefObject } from 'react';

import type { TourStep } from './tourTypes';

type TourDialogProps = {
  step: TourStep;
  stepIndex: number;
  stepCount: number;
  targetMissing: boolean;
  dialogPosition: CSSProperties;
  dialogRef: RefObject<HTMLDivElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onBack: () => void;
  onSkipStep: () => void;
  onAdvance: () => void;
  onClose: () => void;
};

const TourDialog = ({
  step,
  stepIndex,
  stepCount,
  targetMissing,
  dialogPosition,
  dialogRef,
  closeButtonRef,
  onBack,
  onSkipStep,
  onAdvance,
  onClose,
}: TourDialogProps) => {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <div
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed z-[1001] flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-surface-raised text-content-primary shadow-2xl"
      data-testid="tour-dialog"
      ref={dialogRef}
      role="dialog"
      style={dialogPosition}
      tabIndex={-1}
    >
      <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-content-muted">
            Step {stepIndex + 1} of {stepCount}
          </p>
          <h2
            id={titleId}
            aria-live="polite"
            aria-atomic="true"
            className="mt-1 text-lg font-semibold"
          >
            {step.title}
          </h2>
        </div>
        <button
          aria-label="Close tour"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-content-secondary hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
        <p id={descriptionId} className="text-sm leading-6 text-content-secondary">
          {step.body}
        </p>
        {targetMissing && step.anchor ? (
          <p
            className="mt-3 rounded-md bg-surface-selected px-3 py-2 text-sm text-content-secondary"
            role="status"
          >
            This item isn&apos;t available right now. You can continue the tour from here.
          </p>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 sm:px-5">
        <button
          className="min-h-11 rounded-md px-3 text-sm text-content-secondary hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
          disabled={stepIndex === 0}
          onClick={onBack}
          type="button"
        >
          Back
        </button>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            className="min-h-11 rounded-md px-3 text-sm text-content-secondary hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            onClick={onSkipStep}
            type="button"
          >
            Skip step
          </button>
          <button
            className="min-h-11 rounded-md bg-accent px-4 text-sm font-medium text-content-inverse hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            onClick={onAdvance}
            type="button"
          >
            {stepIndex === stepCount - 1 ? 'Finish tour' : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TourDialog;
