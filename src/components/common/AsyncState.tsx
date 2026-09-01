import { AlertCircle, CircleOff, Inbox, LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type AsyncStateKind = 'loading' | 'empty' | 'unavailable' | 'error';

export interface AsyncStateProps {
  kind: AsyncStateKind;
  title: string;
  description?: string;
  action?: ReactNode;
}

const STATE_PRESENTATION: Record<AsyncStateKind, { icon: LucideIcon; toneClassName: string }> = {
  loading: { icon: LoaderCircle, toneClassName: 'text-status-info' },
  empty: { icon: Inbox, toneClassName: 'text-status-neutral' },
  unavailable: { icon: CircleOff, toneClassName: 'text-status-warning' },
  error: { icon: AlertCircle, toneClassName: 'text-status-danger' },
};

const AsyncState = ({ kind, title, description, action }: AsyncStateProps) => {
  const { icon: StateIcon, toneClassName } = STATE_PRESENTATION[kind];
  const isError = kind === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? undefined : 'polite'}
      aria-atomic="true"
      className="rounded-xl border border-line bg-surface px-5 py-8 text-center text-content-primary"
    >
      <StateIcon
        aria-hidden="true"
        className={`mx-auto h-7 w-7 ${toneClassName} ${
          kind === 'loading' ? 'animate-spin motion-reduce:animate-none' : ''
        }`}
      />
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mx-auto mt-1 max-w-prose text-sm leading-relaxed text-content-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
};

export default AsyncState;
