import { useEffect, useMemo, useRef, useState } from 'react';

import {
  createSpotlightStyle,
  createTourDialogPosition,
  type TourTargetRect,
} from './tourGeometry';

const INITIAL_VIEWPORT = { width: 1024, height: 768 };
const INITIAL_DIALOG_SIZE = { width: 448, height: 256 };

export function useTourDialogLayout(targetRect: TourTargetRect | null, stepId: string) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [viewport, setViewport] = useState(() =>
    typeof window === 'undefined'
      ? INITIAL_VIEWPORT
      : { width: window.innerWidth, height: window.innerHeight }
  );
  const [dialogSize, setDialogSize] = useState(INITIAL_DIALOG_SIZE);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      const rect = dialog.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDialogSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(dialog);
    window.addEventListener('resize', update, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [stepId]);

  const dialogPosition = useMemo(
    () => createTourDialogPosition(targetRect, dialogSize, viewport),
    [dialogSize, targetRect, viewport]
  );
  const spotlightStyle = useMemo(() => createSpotlightStyle(targetRect), [targetRect]);

  return { closeButtonRef, dialogPosition, dialogRef, spotlightStyle };
}
