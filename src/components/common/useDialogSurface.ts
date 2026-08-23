import { type RefObject, useCallback, useLayoutEffect, useRef } from 'react';

import {
  topOverlay,
  isTopmostOverlay,
  registerOverlay,
  unregisterOverlay,
  type OverlayEntry,
} from './overlayStack';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

const hasVisibleTree = (element: HTMLElement) => {
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = window.getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') {
      return false;
    }
  }
  const browserHasLayout = document.documentElement.getClientRects().length > 0;
  return !browserHasLayout || element.getClientRects().length > 0;
};

const isTabbableCandidate = (element: HTMLElement) => {
  if (element.hidden || element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
  if (element.matches(':disabled')) return false;
  if (element instanceof HTMLInputElement && element.type === 'hidden') return false;
  if (!hasVisibleTree(element)) return false;
  const editable = element.getAttribute('contenteditable');
  return (
    element.tabIndex >= 0 ||
    (editable !== null && editable !== 'false' && !element.hasAttribute('tabindex'))
  );
};

const getTabbableElements = (scope: ParentNode) => {
  const candidates = Array.from(
    scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(isTabbableCandidate);
  const radioFiltered = candidates.filter((candidate) => {
    if (!(candidate instanceof HTMLInputElement) || candidate.type !== 'radio' || !candidate.name) {
      return true;
    }
    const group = candidates.filter(
      (other): other is HTMLInputElement =>
        other instanceof HTMLInputElement &&
        other.type === 'radio' &&
        other.name === candidate.name &&
        other.form === candidate.form
    );
    const checked = group.find((radio) => radio.checked);
    return checked ? checked === candidate : group[0] === candidate;
  });

  return radioFiltered
    .map((element, documentIndex) => ({ documentIndex, element, tabIndex: element.tabIndex }))
    .sort((left, right) => {
      const leftOrder = left.tabIndex > 0 ? left.tabIndex : Number.MAX_SAFE_INTEGER;
      const rightOrder = right.tabIndex > 0 ? right.tabIndex : Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.documentIndex - right.documentIndex;
    })
    .map(({ element }) => element);
};

type UseDialogSurfaceArgs = {
  isOpen: boolean;
  isDismissible: boolean;
  onClose: () => void;
  surfaceRef: {
    current: HTMLElement | null;
  };
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  onCloseAttempt?: () => void;
};

export function useDialogSurface({
  isOpen,
  isDismissible,
  onClose,
  surfaceRef,
  initialFocusRef,
  returnFocusRef,
  onCloseAttempt,
}: UseDialogSurfaceArgs) {
  const idRef = useRef<symbol>();
  const openerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(isDismissible);
  const closeAttemptRef = useRef(onCloseAttempt);
  const surfaceRefRef = useRef(surfaceRef);
  const initialFocusRefRef = useRef(initialFocusRef);
  const returnFocusRefRef = useRef(returnFocusRef);

  if (!idRef.current) idRef.current = Symbol('dialog-surface');

  const surfaceId = idRef.current;

  onCloseRef.current = onClose;
  dismissibleRef.current = isDismissible;
  closeAttemptRef.current = onCloseAttempt;
  surfaceRefRef.current = surfaceRef;
  initialFocusRefRef.current = initialFocusRef;
  returnFocusRefRef.current = returnFocusRef;

  const focusSurface = useCallback(() => {
    const surface = surfaceRefRef.current.current;
    const initial = initialFocusRefRef.current?.current;
    const focusables = surface ? getTabbableElements(surface) : [];
    if (initial?.isConnected && surface?.contains(initial) && focusables.includes(initial)) {
      initial.focus();
      return;
    }

    const first = focusables[0];
    (first ?? surface)?.focus();
  }, []);

  const focusSurfaceElements = useCallback(() => {
    const surface = surfaceRefRef.current.current;
    if (!surface) return [];
    return getTabbableElements(surface);
  }, []);

  const trapFocus = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      if (!isTopmostOverlay(surfaceId)) return;

      const focusables = focusSurfaceElements();
      if (focusables.length === 0) {
        event.preventDefault();
        surfaceRefRef.current.current?.focus();
        return;
      }

      const active = document.activeElement;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const focusInside = surfaceRefRef.current.current?.contains(active);

      if (event.shiftKey && (active === first || !focusInside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !focusInside)) {
        event.preventDefault();
        first.focus();
      }
    },
    [focusSurfaceElements, surfaceId]
  );

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (!isTopmostOverlay(surfaceId)) return;

      if (!dismissibleRef.current) return;
      event.preventDefault();
      if (closeAttemptRef.current) closeAttemptRef.current();
      else onCloseRef.current();
    },
    [surfaceId]
  );

  useLayoutEffect(() => {
    if (!isOpen) return;
    if (!surfaceRef.current) return;

    openerRef.current =
      returnFocusRefRef.current?.current ??
      (document.activeElement instanceof HTMLElement ? document.activeElement : null);

    const entry: OverlayEntry = {
      id: surfaceId,
      focus: focusSurface,
      surface: () => surfaceRefRef.current.current,
    };
    registerOverlay(entry);

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', trapFocus);

    const focusFrame = window.requestAnimationFrame(() => {
      if (isTopmostOverlay(surfaceId)) focusSurface();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', trapFocus);

      const wasTopmost = unregisterOverlay(surfaceId);
      if (!wasTopmost) return;
      const opener = returnFocusRefRef.current?.current ?? openerRef.current;
      queueMicrotask(() => {
        const currentOverlay = topOverlay();
        const currentSurface = currentOverlay?.surface();
        const openerBelongsToCurrentLayer =
          !currentOverlay || Boolean(currentSurface?.contains(opener));
        if (opener?.isConnected && openerBelongsToCurrentLayer) {
          opener.focus();
          if (document.activeElement === opener) return;
        }
        currentOverlay?.focus();
      });
    };
  }, [focusSurface, handleEscape, isOpen, surfaceId, trapFocus]);

  return { isTopmost: () => isTopmostOverlay(surfaceId) };
}
