import { CircleHelp } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

const PayrollHelp = ({ label, children }: { label: string; children: string }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open]);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <CircleHelp size={17} aria-hidden="true" />
      </button>
      <span
        id={id}
        role="tooltip"
        className={`absolute right-0 top-full z-20 w-64 rounded-lg border border-line bg-surface p-3 text-left text-xs text-content-primary shadow-card ${open ? 'block' : 'hidden'}`}
      >
        {children}
      </span>
    </span>
  );
};
export default PayrollHelp;
