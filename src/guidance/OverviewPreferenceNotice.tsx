import type { PreferenceErrorOperation } from './overviewPreferenceTypes';

type Props = {
  activeError: PreferenceErrorOperation;
  dismissalSaving: boolean;
  onRetry: () => void;
  onDismiss: () => void;
};

const OverviewPreferenceNotice = ({ activeError, dismissalSaving, onRetry, onDismiss }: Props) => (
  <div
    role="alert"
    className="fixed bottom-6 left-1/2 z-[100] flex max-w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-lg border border-status-danger/40 bg-surface-raised px-4 py-3 text-content-primary shadow-lg"
  >
    <p className="text-sm font-medium">
      {activeError === 'read'
        ? 'We could not check whether the application overview was dismissed.'
        : 'Your overview preference could not be saved.'}
    </p>
    <button
      type="button"
      className="min-h-9 shrink-0 rounded-md px-3 text-sm font-semibold text-accent hover:bg-surface-selected focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60"
      disabled={dismissalSaving}
      onClick={onRetry}
    >
      {dismissalSaving ? 'Saving…' : 'Retry'}
    </button>
    <button
      type="button"
      className="min-h-9 shrink-0 rounded-md px-2 text-sm text-content-secondary hover:bg-surface-selected focus-visible:ring-2 focus-visible:ring-focus"
      onClick={onDismiss}
      aria-label="Dismiss preference message"
    >
      ×
    </button>
  </div>
);

export default OverviewPreferenceNotice;
