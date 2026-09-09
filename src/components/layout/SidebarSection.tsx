import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

import type { NavigationDestination, NavigationSection } from '../../navigation/navigationModel';
import { activeNavigationSection } from '../../navigation/navigationSelectors';
import { useAnchoredPopoverPosition } from '../common/useAnchoredPopoverPosition';
import { usePopover } from '../common/usePopover';

import SidebarDestination from './SidebarDestination';

interface SidebarSectionProps {
  section: NavigationSection;
  destinations: NavigationDestination[];
  flyout?: boolean;
  compact?: boolean;
  onNavigate: () => void;
}

const SidebarSectionDestinations = ({
  destinations,
  onNavigate,
}: Pick<SidebarSectionProps, 'destinations' | 'onNavigate'>) => (
  <>
    {destinations.map((destination) => (
      <SidebarDestination
        key={destination.path}
        destination={destination}
        nested
        onNavigate={onNavigate}
      />
    ))}
  </>
);

function useHoverDismissal(open: boolean, dismiss: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, dismiss]);
}

const SidebarSection = ({
  section,
  destinations,
  flyout = false,
  compact = false,
  onNavigate,
}: SidebarSectionProps) => {
  const [mode, setMode] = useState<'hover' | 'keyboard' | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const active = activeNavigationSection(location.pathname + location.search) === section.key;
  const open = flyout && mode !== null;
  useHoverDismissal(open && mode === 'hover', () => setMode(null));
  const popover = usePopover<HTMLAnchorElement>({
    open,
    onClose: () => setMode(null),
    focusOnOpen: mode === 'keyboard',
  });
  const position = useAnchoredPopoverPosition({
    open,
    align: 'start',
    side: 'right',
    panelRef: popover.panelRef,
    triggerRef: popover.triggerRef,
  });
  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (mode === 'keyboard' && popover.panelRef.current?.contains(document.activeElement)) return;
      popover.close(false);
    }, 250);
  };
  useEffect(() => {
    setMode(null);
    return () => clearTimeout(closeTimer.current);
  }, [location.pathname, location.search, flyout, compact]);
  const navigate = () => {
    cancelClose();
    popover.close(false);
    onNavigate();
  };
  const Icon = section.icon;
  const [first] = destinations as (NavigationDestination | undefined)[];
  if (!first) return null;
  const content = <SidebarSectionDestinations destinations={destinations} onNavigate={navigate} />;
  return (
    <section className="pt-1" aria-label={section.label}>
      <Link
        ref={popover.triggerRef}
        to={first.path}
        onClick={(event) => {
          if (compact) {
            event.preventDefault();
            cancelClose();
            setMode((current) => (current === 'keyboard' ? null : 'keyboard'));
          } else navigate();
        }}
        title={section.label}
        {...(flyout ? { 'aria-expanded': open, 'aria-controls': popover.panelProps.id } : {})}
        data-active={active || undefined}
        className={`mx-1 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none ${open || active ? 'bg-surface-selected text-content-primary' : 'text-content-secondary hover:bg-surface-selected'}`}
        onPointerEnter={(event) => {
          if (flyout && event.pointerType !== 'touch') {
            cancelClose();
            setMode((current) => current ?? 'hover');
          }
        }}
        onPointerLeave={scheduleClose}
        onBlur={(event) => {
          if (!popover.panelRef.current?.contains(event.relatedTarget)) popover.close(false);
        }}
        onKeyDown={(event) => {
          if (flyout && (event.key === 'ArrowRight' || event.key === 'ArrowDown')) {
            event.preventDefault();
            if (mode === 'keyboard')
              popover.panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
            else setMode('keyboard');
          } else popover.triggerProps.onKeyDown(event);
        }}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span data-compact={compact} className="data-[compact=true]:sr-only">
          {section.label}
        </span>
      </Link>
      {open
        ? createPortal(
            <div
              ref={popover.panelRef}
              {...popover.panelProps}
              data-popover-panel="true"
              tabIndex={-1}
              aria-label={`${section.label} pages`}
              style={position.style}
              onPointerEnter={cancelClose}
              onPointerLeave={scheduleClose}
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget) &&
                  !popover.triggerRef.current?.contains(event.relatedTarget)
                )
                  popover.close(false);
              }}
              className="fixed z-40 w-64 space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface p-2 text-content-primary shadow-xl"
            >
              {content}
            </div>,
            document.body
          )
        : null}
      {!flyout ? (
        <div className="ml-5 mt-1 space-y-0.5 border-l border-line pl-2">{content}</div>
      ) : null}
    </section>
  );
};
export default SidebarSection;
