import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState, type ComponentPropsWithRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import type { NavigationDestination, NavigationSection } from '../../navigation/navigationModel';
import { activeNavigationSection } from '../../navigation/navigationSelectors';
import { useAnchoredPopoverPosition } from '../common/useAnchoredPopoverPosition';
import { usePopover } from '../common/usePopover';

import SidebarDestination from './SidebarDestination';

interface SidebarSectionProps {
  section: NavigationSection;
  destinations: NavigationDestination[];
  expanded: boolean;
  compact: boolean;
  flyout?: boolean;
  onToggle: () => void;
  onRequestExpand: () => void;
  onNavigate: () => void;
}

interface SidebarSectionButtonProps {
  section: NavigationSection;
  compact: boolean;
  flyout: boolean;
  expanded: boolean;
  active: boolean;
  buttonProps: ComponentPropsWithRef<'button'>;
}

const SectionChevron = ({
  flyout,
  compact,
  expanded,
}: Pick<SidebarSectionButtonProps, 'flyout' | 'compact' | 'expanded'>) => {
  const Chevron = flyout ? ChevronRight : ChevronDown;
  const chevronClass = flyout && compact ? 'lg:hidden' : '';
  const rotation = !flyout && expanded ? 'rotate-180' : '';
  return <Chevron className={`h-4 w-4 ${chevronClass} ${rotation}`} aria-hidden />;
};

const SidebarSectionButton = ({
  section,
  compact,
  flyout,
  expanded,
  active,
  buttonProps,
}: SidebarSectionButtonProps) => {
  const Icon = section.icon;
  return (
    <button
      {...buttonProps}
      id={`navigation-section-${section.key}-label`}
      data-active={active || undefined}
      type="button"
      title={compact ? section.label : undefined}
      className={[
        'mx-1 flex w-[calc(100%-0.5rem)] items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        compact ? 'lg:justify-center lg:px-2' : '',
        expanded || active
          ? 'bg-surface-selected text-content-primary'
          : 'text-content-secondary hover:bg-surface-selected',
      ].join(' ')}
    >
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
        <span className={compact ? 'lg:sr-only' : undefined}>{section.label}</span>
      </span>
      <SectionChevron flyout={flyout} compact={compact} expanded={expanded} />
    </button>
  );
};

const SidebarSection = ({
  section,
  destinations,
  expanded,
  compact,
  flyout = false,
  onToggle,
  onRequestExpand,
  onNavigate,
}: SidebarSectionProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const active = activeNavigationSection(location.pathname + location.search) === section.key;
  const popover = usePopover({ open: flyout && open, onClose: () => setOpen(false) });
  const position = useAnchoredPopoverPosition({
    open: flyout && open,
    align: 'start',
    side: 'right',
    panelRef: popover.panelRef,
    triggerRef: popover.triggerRef,
  });
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search, compact, flyout]);
  const contentId = `navigation-section-${section.key}`;
  const isExpanded = flyout ? open : expanded;
  const navigate = () => {
    popover.close(false);
    onNavigate();
  };
  return (
    <section className="pt-2" aria-labelledby={`${contentId}-label`}>
      <SidebarSectionButton
        section={section}
        compact={compact}
        flyout={flyout}
        expanded={isExpanded}
        active={active}
        buttonProps={{
          ref: popover.triggerRef,
          ...(flyout
            ? popover.triggerProps
            : { 'aria-expanded': expanded, 'aria-controls': contentId }),
          onClick: () => {
            if (flyout) setOpen((value) => !value);
            else {
              if (compact) onRequestExpand();
              onToggle();
            }
          },
          onKeyDown: (event) => {
            if (flyout && (event.key === 'ArrowRight' || (event.key === 'ArrowDown' && !open))) {
              event.preventDefault();
              setOpen(true);
            } else if (flyout) popover.triggerProps.onKeyDown(event);
          },
        }}
      />

      {flyout && open
        ? createPortal(
            <div
              ref={popover.panelRef}
              {...popover.panelProps}
              data-popover-panel="true"
              tabIndex={-1}
              aria-label={`${section.label} pages`}
              style={position.style}
              className="fixed z-40 w-72 overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface p-3 text-content-primary shadow-xl"
            >
              <p className="mb-3 text-base font-semibold">{section.label}</p>
              <div className="space-y-1">
                {destinations.map((destination) => (
                  <SidebarDestination
                    key={destination.path}
                    destination={destination}
                    nested
                    onNavigate={navigate}
                  />
                ))}
              </div>
            </div>,
            document.body
          )
        : null}
      {!flyout && expanded ? (
        <div id={contentId} className="ml-2 mt-1 space-y-0.5 border-l border-line pl-2">
          {destinations.map((destination) => (
            <SidebarDestination
              key={destination.path}
              destination={destination}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};
export default SidebarSection;
