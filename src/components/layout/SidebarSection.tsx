import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import type { NavigationDestination, NavigationSection } from '../../navigation/navigationModel';
import { usePopover } from '../common/usePopover';
import { useAnchoredPopoverPosition } from '../common/useAnchoredPopoverPosition';
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

function destinationGroup(destination: NavigationDestination): string {
  const path = destination.path;
  if (/attendance|timesheet|leave/.test(path)) return 'Time & leave';
  if (/employees|onboarding|offboarding|profile|org-chart/.test(path)) return 'People';
  if (/expense|payroll|salary|tax/.test(path)) return 'Expenses & payroll';
  if (/access|settings|module-health/.test(path)) return 'Access & settings';
  return 'Operations';
}

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
  }, [location.pathname, compact, flyout]);
  const Icon = section.icon;
  const contentId = `navigation-section-${section.key}`;
  const isExpanded = flyout ? open : expanded;
  const grouped = new Map<string, NavigationDestination[]>();
  for (const destination of destinations) {
    const group =
      section.key === 'hr' || section.key === 'admin'
        ? destinationGroup(destination)
        : section.label;
    grouped.set(group, [...(grouped.get(group) ?? []), destination]);
  }
  const navigate = () => {
    popover.close(false);
    onNavigate();
  };
  return (
    <section className="pt-2" aria-labelledby={`${contentId}-label`}>
      <button
        id={`${contentId}-label`}
        type="button"
        ref={popover.triggerRef}
        {...(flyout
          ? popover.triggerProps
          : { 'aria-expanded': expanded, 'aria-controls': contentId })}
        onClick={() => {
          if (flyout) setOpen((value) => !value);
          else {
            if (compact) onRequestExpand();
            onToggle();
          }
        }}
        onKeyDown={(event) => {
          if (flyout && (event.key === 'ArrowRight' || (event.key === 'ArrowDown' && !open))) {
            event.preventDefault();
            setOpen(true);
          } else if (flyout) popover.triggerProps.onKeyDown(event);
        }}
        title={compact ? section.label : undefined}
        className={[
          'mx-1 flex w-[calc(100%-0.5rem)] items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          compact ? 'lg:justify-center lg:px-2' : '',
          isExpanded
            ? 'bg-surface-selected text-content-primary'
            : 'text-content-secondary hover:bg-surface-selected',
        ].join(' ')}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          <span className={compact ? 'lg:sr-only' : undefined}>{section.label}</span>
        </span>
        {flyout ? (
          <ChevronRight className={`h-4 w-4 ${compact ? 'lg:hidden' : ''}`} aria-hidden />
        ) : (
          <ChevronDown className={`h-4 w-4 ${expanded ? 'rotate-180' : ''}`} aria-hidden />
        )}
      </button>
      {flyout && open
        ? createPortal(
            <div
              ref={popover.panelRef}
              {...popover.panelProps}
              data-popover-panel="true"
              tabIndex={-1}
              aria-label={`${section.label} pages`}
              style={position.style}
              className={`fixed z-40 overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface p-4 text-content-primary shadow-xl ${grouped.size > 1 ? 'w-[36rem]' : 'w-72'}`}
            >
              <p className="mb-3 text-base font-semibold">{section.label}</p>
              <div className={grouped.size > 1 ? 'grid grid-cols-2 gap-4' : 'space-y-1'}>
                {[...grouped].map(([name, links]) => (
                  <div key={name}>
                    {grouped.size > 1 && (
                      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-content-muted">
                        {name}
                      </p>
                    )}
                    {links.map((destination) => (
                      <SidebarDestination
                        key={destination.path}
                        destination={destination}
                        nested
                        onNavigate={navigate}
                      />
                    ))}
                  </div>
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
