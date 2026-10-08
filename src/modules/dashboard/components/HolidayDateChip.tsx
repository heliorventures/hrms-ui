import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAnchoredPopoverPosition } from '../../../components/common/useAnchoredPopoverPosition';

interface HolidayDateChipProps {
  holiday: { holidayDate: string; name: string; calendarName: string };
}

const HolidayDateChip = ({ holiday }: HolidayDateChipProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const position = useAnchoredPopoverPosition({ open, align: 'start', triggerRef, panelRef });
  const date = new Date(holiday.holidayDate);
  const dateLabel = date.toLocaleDateString(undefined, { dateStyle: 'full', timeZone: 'UTC' });
  return (
    <li>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${holiday.name}, ${dateLabel}`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') setOpen(true);
        }}
        onPointerLeave={() => {
          if (document.activeElement !== triggerRef.current) setOpen(false);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
        className="flex h-14 min-w-14 items-center justify-center rounded-xl bg-accent/10 px-3 text-accent hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <time dateTime={holiday.holidayDate.slice(0, 10)} className="flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase">
            {date.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' })}
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {date.toLocaleDateString(undefined, { day: 'numeric', timeZone: 'UTC' })}
          </span>
        </time>
      </button>
      {createPortal(
        <div
          ref={panelRef}
          id={id}
          role="tooltip"
          hidden={!open}
          style={position.style}
          className="pointer-events-none fixed z-50 w-64 rounded-lg border border-line bg-surface p-3 text-sm shadow-xl"
        >
          <p className="min-w-0 break-words font-semibold text-content-primary">{holiday.name}</p>
          <p className="mt-1 break-words text-xs text-content-secondary">
            {dateLabel} · {holiday.calendarName}
          </p>
        </div>,
        document.body
      )}
    </li>
  );
};

export default HolidayDateChip;
