import { MoreHorizontal } from 'lucide-react';
import { Fragment, type KeyboardEventHandler, type ReactNode, useState } from 'react';

import ActionMenuEntry from './ActionMenuEntry';
import IconButton from './IconButton';
import { useAnchoredPopoverPosition } from './useAnchoredPopoverPosition';
import { usePopover } from './usePopover';

export type ActionMenuItem =
  | {
      id: string;
      label: string;
      href: string;
      icon?: ReactNode;
      disabled?: boolean;
    }
  | {
      id: string;
      label: string;
      onSelect: () => void;
      icon?: ReactNode;
      disabled?: boolean;
      tone?: 'default' | 'danger';
    };

export interface ActionMenuProps {
  label: string;
  items: readonly ActionMenuItem[];
  align?: 'start' | 'end';
  onNavigate?: () => void;
  triggerIcon?: ReactNode;
  header?: ReactNode;
}

const DOCUMENT_TAB_STOP_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function adjacentTabStop(trigger: HTMLElement, reverse: boolean): HTMLElement | null {
  const stops = Array.from(
    document.body.querySelectorAll<HTMLElement>(DOCUMENT_TAB_STOP_SELECTOR)
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.closest('[hidden], [inert], [aria-hidden="true"], [data-popover-panel="true"]')
  );
  const triggerIndex = stops.indexOf(trigger);
  if (triggerIndex < 0) return null;
  return stops[triggerIndex + (reverse ? -1 : 1)] ?? null;
}

const ActionMenu = ({
  label,
  items,
  align = 'end',
  onNavigate,
  triggerIcon,
  header,
}: ActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const popover = usePopover({ open, onClose: () => setOpen(false) });
  const position = useAnchoredPopoverPosition({
    align,
    open,
    panelRef: popover.panelRef,
    triggerRef: popover.triggerRef,
  });
  const firstDangerIndex = items.findIndex((item) => 'onSelect' in item && item.tone === 'danger');

  const handleTriggerKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    popover.triggerProps.onKeyDown(event);
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleMenuKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    popover.panelProps.onKeyDown(event);
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const trigger = popover.triggerRef.current;
    const target = trigger ? adjacentTabStop(trigger, event.shiftKey) : null;
    setOpen(false);
    queueMicrotask(() => (target ?? trigger)?.focus());
  };

  return (
    <div className="relative inline-flex">
      <IconButton
        ref={popover.triggerRef}
        label={label}
        icon={triggerIcon ?? <MoreHorizontal className="h-5 w-5" />}
        title={label}
        aria-haspopup="menu"
        aria-expanded={popover.triggerProps['aria-expanded']}
        aria-controls={popover.triggerProps['aria-controls']}
        onKeyDown={handleTriggerKeyDown}
        onClick={() => setOpen((current) => !current)}
      />

      {open ? (
        <div
          ref={popover.panelRef}
          {...popover.panelProps}
          onKeyDown={handleMenuKeyDown}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          data-align={align}
          data-placement={position.placement}
          data-popover-panel="true"
          style={position.style}
          className="fixed z-50 max-h-[calc(100dvh-2rem)] w-56 max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface py-1 text-content-primary shadow-xl"
        >
          {header ? (
            <div className="border-b border-line-subtle px-3 py-2 text-sm">{header}</div>
          ) : null}
          {items.map((item, index) => (
            <Fragment key={item.id}>
              {index === firstDangerIndex ? (
                <div role="separator" className="my-1 border-t border-line" />
              ) : null}
              <ActionMenuEntry item={item} onClose={() => setOpen(false)} onNavigate={onNavigate} />
            </Fragment>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ActionMenu;
