import { type CSSProperties, type RefObject, useCallback, useLayoutEffect, useState } from 'react';

const VIEWPORT_GUTTER = 16;
const TRIGGER_GAP = 8;

interface AnchoredPopoverPosition {
  placement: 'top' | 'bottom' | 'right' | 'left';
  style: CSSProperties;
}

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function cssPixels(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readSafeAreaInsets(): SafeAreaInsets {
  const probe = document.createElement('div');
  probe.setAttribute('data-safe-area-probe', 'true');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;' +
    'padding-top:env(safe-area-inset-top);padding-right:env(safe-area-inset-right);' +
    'padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);';
  document.body.appendChild(probe);
  const style = window.getComputedStyle(probe);
  const insets = {
    top: cssPixels(style.paddingTop),
    right: cssPixels(style.paddingRight),
    bottom: cssPixels(style.paddingBottom),
    left: cssPixels(style.paddingLeft),
  };
  probe.remove();
  return insets;
}

export function useAnchoredPopoverPosition({
  align,
  side = 'bottom',
  open,
  panelRef,
  triggerRef,
}: {
  align: 'start' | 'end';
  side?: 'bottom' | 'right';
  open: boolean;
  panelRef: RefObject<HTMLElement>;
  triggerRef: RefObject<HTMLElement>;
}): AnchoredPopoverPosition {
  const [position, setPosition] = useState<AnchoredPopoverPosition>({
    placement: 'bottom',
    style: { left: VIEWPORT_GUTTER, top: VIEWPORT_GUTTER, visibility: 'hidden' },
  });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const triggerRect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const visualViewport = window.visualViewport;
    const viewportLeft = visualViewport?.offsetLeft ?? 0;
    const viewportTop = visualViewport?.offsetTop ?? 0;
    const viewportWidth = visualViewport?.width ?? window.innerWidth;
    const viewportHeight = visualViewport?.height ?? window.innerHeight;
    const safeArea = readSafeAreaInsets();
    const minimumLeft = viewportLeft + safeArea.left + VIEWPORT_GUTTER;
    const maximumRight = viewportLeft + viewportWidth - safeArea.right - VIEWPORT_GUTTER;
    const minimumTop = viewportTop + safeArea.top + VIEWPORT_GUTTER;
    const maximumBottom = viewportTop + viewportHeight - safeArea.bottom - VIEWPORT_GUTTER;
    const maxWidth = Math.max(0, maximumRight - minimumLeft);
    const maxHeight = Math.max(0, maximumBottom - minimumTop);
    const panelWidth = Math.min(panelRect.width, maxWidth);
    const panelHeight = Math.min(panelRect.height, maxHeight);
    if (side === 'right') {
      const fitsRight = triggerRect.right + TRIGGER_GAP + panelWidth <= maximumRight;
      const preferredLeft = fitsRight
        ? triggerRect.right + TRIGGER_GAP
        : triggerRect.left - panelWidth - TRIGGER_GAP;
      setPosition({
        placement: fitsRight ? 'right' : 'left',
        style: {
          left: Math.max(minimumLeft, Math.min(preferredLeft, maximumRight - panelWidth)),
          top: Math.max(minimumTop, Math.min(triggerRect.top, maximumBottom - panelHeight)),
          maxHeight,
          maxWidth,
          visibility: 'visible',
        },
      });
      return;
    }
    const preferredLeft = align === 'start' ? triggerRect.left : triggerRect.right - panelWidth;
    const maximumLeft = Math.max(minimumLeft, maximumRight - panelWidth);
    const left = Math.min(Math.max(preferredLeft, minimumLeft), maximumLeft);
    const fitsAbove = triggerRect.top - panelHeight - TRIGGER_GAP >= minimumTop;
    const overflowsBelow = triggerRect.bottom + TRIGGER_GAP + panelHeight > maximumBottom;
    const placement = overflowsBelow && fitsAbove ? 'top' : 'bottom';
    const unclampedTop =
      placement === 'top'
        ? triggerRect.top - panelHeight - TRIGGER_GAP
        : triggerRect.bottom + TRIGGER_GAP;
    const maximumTop = Math.max(minimumTop, maximumBottom - panelHeight);
    const top = Math.min(Math.max(unclampedTop, minimumTop), maximumTop);

    setPosition({
      placement,
      style: { left, top, maxHeight, maxWidth, visibility: 'visible' },
    });
  }, [align, side, panelRef, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const visualViewport = window.visualViewport;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { capture: true, passive: true });
    visualViewport?.addEventListener('resize', updatePosition);
    visualViewport?.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      visualViewport?.removeEventListener('resize', updatePosition);
      visualViewport?.removeEventListener('scroll', updatePosition);
    };
  }, [open, updatePosition]);

  return position;
}
