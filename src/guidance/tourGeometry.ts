import type { CSSProperties } from 'react';

export type TourTargetRect = Pick<
  DOMRect,
  'bottom' | 'height' | 'left' | 'right' | 'top' | 'width'
>;

export type TourViewport = { width: number; height: number };
export type TourDialogSize = { width: number; height: number };

const VIEWPORT_GUTTER = 16;
const SPOTLIGHT_GUTTER = 8;

function dialogTop(
  rect: TourTargetRect | null,
  dialog: TourDialogSize,
  viewport: TourViewport
): number {
  if (rect) {
    const below = rect.bottom + SPOTLIGHT_GUTTER;
    if (below + dialog.height <= viewport.height - VIEWPORT_GUTTER) return below;
    const above = rect.top - dialog.height - SPOTLIGHT_GUTTER;
    if (above >= VIEWPORT_GUTTER) return above;
  }
  return Math.max(VIEWPORT_GUTTER, (viewport.height - dialog.height) / 2);
}

export function createSpotlightStyle(rect: TourTargetRect | null): CSSProperties | null {
  if (!rect) return null;
  return {
    height: Math.max(0, rect.height + SPOTLIGHT_GUTTER * 2),
    left: rect.left - SPOTLIGHT_GUTTER,
    top: rect.top - SPOTLIGHT_GUTTER,
    width: Math.max(0, rect.width + SPOTLIGHT_GUTTER * 2),
  };
}

export function createTourDialogPosition(
  rect: TourTargetRect | null,
  dialog: TourDialogSize,
  viewport: TourViewport
): CSSProperties {
  const width = Math.min(dialog.width, Math.max(280, viewport.width - VIEWPORT_GUTTER * 2));
  const maxHeight = Math.max(180, viewport.height - VIEWPORT_GUTTER * 2);
  if (viewport.width < 640) {
    return {
      left: VIEWPORT_GUTTER,
      bottom: `calc(${VIEWPORT_GUTTER}px + env(safe-area-inset-bottom))`,
      maxHeight: `calc(100dvh - ${VIEWPORT_GUTTER * 2}px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`,
      maxWidth: `calc(100vw - ${VIEWPORT_GUTTER * 2}px)`,
      width,
    };
  }

  const left = rect
    ? Math.min(
        Math.max(VIEWPORT_GUTTER, rect.left + rect.width / 2 - width / 2),
        viewport.width - width - VIEWPORT_GUTTER
      )
    : (viewport.width - width) / 2;
  return {
    left,
    maxHeight: `${maxHeight}px`,
    maxWidth: `calc(100vw - ${VIEWPORT_GUTTER * 2}px)`,
    top: dialogTop(rect, dialog, viewport),
    width,
  };
}
