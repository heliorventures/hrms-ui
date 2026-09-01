import {
  type KeyboardEvent as ReactKeyboardEvent,
  type KeyboardEventHandler,
  type RefObject,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';

const POPOVER_FOCUSABLE_SELECTOR = [
  '[role="menuitem"]:not([aria-disabled="true"])',
  'button:not([disabled])',
  'a[href]:not([aria-disabled="true"])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])',
].join(',');

interface ActivePopover {
  closeForReplacement: () => void;
  id: symbol;
}

let activePopover: ActivePopover | null = null;

function focusableElements(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(POPOVER_FOCUSABLE_SELECTOR)).filter(
    (element) => !element.closest('[hidden], [inert], [aria-hidden="true"]')
  );
}

function initialFocusElement(panel: HTMLElement): HTMLElement | null {
  const focusables = focusableElements(panel);
  return (
    focusables.find(
      (element) =>
        element.matches('[role="menuitem"]') || element.hasAttribute('data-popover-item')
    ) ??
    focusables[0] ??
    null
  );
}

export function usePopover(options: { open: boolean; onClose: () => void }): {
  triggerRef: RefObject<HTMLButtonElement>;
  panelRef: RefObject<HTMLDivElement>;
  triggerProps: {
    'aria-expanded': boolean;
    'aria-controls': string;
    onKeyDown: KeyboardEventHandler;
  };
  panelProps: { id: string; onKeyDown: KeyboardEventHandler };
} {
  const panelId = useId();
  const popoverIdRef = useRef(Symbol('popover'));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(options.onClose);
  const closingRef = useRef(false);
  const restoreFocusRef = useRef(true);
  onCloseRef.current = options.onClose;

  const requestClose = useCallback((restoreFocus = true) => {
    if (closingRef.current) return;
    closingRef.current = true;
    restoreFocusRef.current = restoreFocus;
    if (activePopover?.id === popoverIdRef.current) activePopover = null;
    onCloseRef.current();
  }, []);

  const focusByIndex = useCallback((event: ReactKeyboardEvent, index: number) => {
    const panel = panelRef.current;
    if (!panel) return;
    const items = focusableElements(panel);
    if (!items.length) return;
    event.preventDefault();
    items[(index + items.length) % items.length]?.focus();
  }, []);

  const handlePanelKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        requestClose();
        return;
      }

      const panel = panelRef.current;
      if (!panel) return;
      const items = focusableElements(panel);
      if (!items.length) return;
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      if (event.key === 'Home') focusByIndex(event, 0);
      else if (event.key === 'End') focusByIndex(event, items.length - 1);
      else if (event.key === 'ArrowDown') focusByIndex(event, currentIndex + 1);
      else if (event.key === 'ArrowUp') focusByIndex(event, currentIndex - 1);
    },
    [focusByIndex, requestClose]
  );

  const handleTriggerKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.key === 'Escape' && options.open) {
        event.preventDefault();
        requestClose();
      } else if (event.key === 'ArrowDown' && options.open) {
        focusByIndex(event, 0);
      }
    },
    [focusByIndex, options.open, requestClose]
  );

  useLayoutEffect(() => {
    if (!options.open) return undefined;

    closingRef.current = false;
    restoreFocusRef.current = true;
    const currentId = popoverIdRef.current;
    if (activePopover && activePopover.id !== currentId) {
      activePopover.closeForReplacement();
    }
    activePopover = {
      id: currentId,
      closeForReplacement: () => requestClose(false),
    };

    const panel = panelRef.current;
    const firstItem = panel ? initialFocusElement(panel) : null;
    const initialTarget = firstItem ?? panel;
    initialTarget?.focus();
    const focusObserver = panel
      ? new MutationObserver(() => {
          if (document.activeElement !== initialTarget) return;
          const nextItem = initialFocusElement(panel);
          if (nextItem && nextItem !== initialTarget) nextItem.focus();
        })
      : null;
    focusObserver?.observe(panel as Node, { childList: true, subtree: true });

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      requestClose();
    };
    document.addEventListener('pointerdown', handleOutsidePointer);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      focusObserver?.disconnect();
      if (activePopover?.id === currentId) activePopover = null;
      if (restoreFocusRef.current && triggerRef.current?.isConnected) {
        triggerRef.current.focus();
      }
    };
  }, [options.open, requestClose]);

  return {
    triggerRef,
    panelRef,
    triggerProps: {
      'aria-expanded': options.open,
      'aria-controls': panelId,
      onKeyDown: handleTriggerKeyDown,
    },
    panelProps: { id: panelId, onKeyDown: handlePanelKeyDown },
  };
}
