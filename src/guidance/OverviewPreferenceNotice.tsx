import FeedbackToast from '../components/common/FeedbackToast';

import type { PreferenceErrorOperation } from './overviewPreferenceTypes';

type Props = {
  activeError: PreferenceErrorOperation;
  dismissalSaving: boolean;
  onRetry: () => void;
  onDismiss: () => void;
};

const OverviewPreferenceNotice = ({ activeError, dismissalSaving, onRetry, onDismiss }: Props) => (
  <FeedbackToast
    variant={'error'}
    action={
      <>
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
      </>
    }
  >
    <p className="text-sm font-medium">
      {activeError === 'read'
        ? 'We could not check whether the application overview was dismissed.'
        : 'Your overview preference could not be saved.'}
    </p>
  </FeedbackToast>
);

export default OverviewPreferenceNotice;
