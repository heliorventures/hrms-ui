import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const PageActionLink = ({ to, label, icon }: { to: string; label: string; icon: ReactNode }) => (
  <Link
    to={to}
    aria-label={label}
    title={label}
    className="group relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line bg-surface px-2.5 text-accent hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
  >
    <span aria-hidden="true">{icon}</span>
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-full z-40 mt-2 hidden w-max max-w-56 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block group-focus-visible:block"
    >
      {label}
    </span>
  </Link>
);

export default PageActionLink;
