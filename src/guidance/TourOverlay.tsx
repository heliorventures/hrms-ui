import { useState } from 'react';
import { createPortal } from 'react-dom';

import { useDialogSurface } from '../components/common/useDialogSurface';

import TourDialog from './TourDialog';
import type { TourDefinition } from './tourTypes';
import { useReducedMotion, useTourAnchor } from './useTourAnchor';
import { useTourDialogLayout } from './useTourDialogLayout';

type TourOverlayProps = {
  tour: TourDefinition;
  onClose: () => void;
  returnFocusRef: { current: HTMLElement | null };
};

export const TourOverlay = ({ tour, onClose, returnFocusRef }: TourOverlayProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = tour.steps[stepIndex];
  const reducedMotion = useReducedMotion();
  const targetRect = useTourAnchor(step?.anchor ?? null, reducedMotion);
  const { closeButtonRef, dialogPosition, dialogRef, spotlightStyle } = useTourDialogLayout(
    targetRect,
    step?.id ?? 'empty'
  );

  useDialogSurface({
    isOpen: true,
    isDismissible: true,
    onClose,
    surfaceRef: dialogRef,
    initialFocusRef: closeButtonRef,
    returnFocusRef,
  });

  if (typeof document === 'undefined' || !step) return null;

  const advance = () => {
    if (stepIndex >= tour.steps.length - 1) onClose();
    else setStepIndex((current) => Math.min(current + 1, tour.steps.length - 1));
  };
  const goBack = () => setStepIndex((current) => Math.max(0, current - 1));

  return createPortal(
    <div
      className={`fixed inset-0 z-[1000] ${targetRect ? 'bg-transparent' : 'bg-slate-950/55'}`}
      data-testid="tour-overlay"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      style={{ overscrollBehavior: 'contain' }}
    >
      {spotlightStyle ? (
        <div
          aria-hidden="true"
          className="pointer-events-auto fixed rounded-md ring-2 ring-focus shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]"
          data-testid="tour-spotlight"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          style={spotlightStyle}
        />
      ) : null}
      <TourDialog
        step={step}
        stepIndex={stepIndex}
        stepCount={tour.steps.length}
        targetMissing={!targetRect}
        dialogPosition={dialogPosition}
        dialogRef={dialogRef}
        closeButtonRef={closeButtonRef}
        onBack={goBack}
        onSkipStep={advance}
        onAdvance={advance}
        onClose={onClose}
      />
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-testid="tour-overlay"] * { scroll-behavior: auto !important; animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      <span className="sr-only" aria-live="polite">
        {reducedMotion ? 'Reduced motion enabled.' : ''}
      </span>
    </div>,
    document.body
  );
};

export default TourOverlay;
