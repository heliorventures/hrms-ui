import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import IconButton from './IconButton';
import { PageInformationContext } from './pageInformationContext';
import { useAnchoredPopoverPosition } from './useAnchoredPopoverPosition';
import { usePopover } from './usePopover';

interface PageInformationProviderProps {
  children: ReactNode;
  /** Route and authorization identity; changing either dismisses stale information. */
  scopeKey: string;
}

const PageInformationProvider = ({ children, scopeKey }: PageInformationProviderProps) => {
  const [sections, setSections] = useState<ReadonlyMap<string, string>>(() => new Map());
  const [openScope, setOpenScope] = useState<string | null>(null);
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const hasInformation = Array.from(sections.values()).includes(scopeKey);
  const isOpen = openScope === scopeKey && hasInformation;

  useEffect(() => setOpenScope(null), [scopeKey]);
  useEffect(() => {
    if (!hasInformation) setOpenScope(null);
  }, [hasInformation]);

  const register = useCallback(
    (id: string) => {
      setSections((current) => new Map(current).set(id, scopeKey));
      return () => {
        setSections((current) => {
          const next = new Map(current);
          next.delete(id);
          return next;
        });
      };
    },
    [scopeKey]
  );
  const close = useCallback(() => setOpenScope(null), []);
  const popover = usePopover<HTMLElement>({ open: isOpen, onClose: close });
  const { triggerRef } = popover;
  const open = useCallback(
    (trigger?: HTMLElement) => {
      triggerRef.current =
        trigger ??
        document.querySelector<HTMLElement>('[data-page-information-trigger]') ??
        (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      setOpenScope(scopeKey);
    },
    [scopeKey, triggerRef]
  );
  const position = useAnchoredPopoverPosition({
    align: 'start',
    open: isOpen,
    panelRef: popover.panelRef,
    triggerRef,
  });
  const value = useMemo(
    () => ({
      register,
      target: isOpen ? target : null,
      hasInformation,
      isOpen,
      open,
      panelId: popover.panelProps.id,
    }),
    [register, target, hasInformation, isOpen, open, popover.panelProps.id]
  );

  return (
    <PageInformationContext.Provider value={value}>
      {children}
      {isOpen
        ? createPortal(
            <div
              {...popover.panelProps}
              ref={popover.panelRef}
              role="dialog"
              aria-label="Page information"
              tabIndex={-1}
              data-popover-panel="true"
              className="app-guidance-popover fixed z-50 w-[26rem] overflow-y-auto rounded-lg border border-line bg-surface p-3 text-content-primary shadow-xl"
              style={position.style}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Page information</p>
                <IconButton
                  label="Close page information"
                  icon={<X className="size-4" />}
                  onClick={() => popover.close()}
                />
              </div>
              <div ref={setTarget} className="space-y-3 break-words" />
            </div>,
            document.body
          )
        : null}
    </PageInformationContext.Provider>
  );
};

export default PageInformationProvider;
