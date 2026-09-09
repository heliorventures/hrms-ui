import Button from '../../../components/common/Button';
import PageNotice from '../../../components/common/PageNotice';

interface ApplyLeaveDiscardNoticeProps {
  onKeepEditing: () => void;
  onDiscard: () => void;
  submitting: boolean;
}

const ApplyLeaveDiscardNotice = ({
  onKeepEditing,
  onDiscard,
  submitting,
}: ApplyLeaveDiscardNoticeProps) => (
  <PageNotice
    variant="warning"
    title="Discard this leave request?"
    focusOnMount
    action={
      <>
        <Button type="button" variant="outline" onClick={onKeepEditing} disabled={submitting}>
          Keep editing
        </Button>
        <Button type="button" variant="outline" onClick={onDiscard} disabled={submitting}>
          Discard request
        </Button>
      </>
    }
  >
    Your entered details and supporting document will be cleared.
  </PageNotice>
);

export default ApplyLeaveDiscardNotice;

export const ApplyLeaveFormFailure = ({
  error,
}: {
  error: { title: string; message: string } | null;
}) =>
  error ? (
    <PageNotice
      key={`${error.title}:${error.message}`}
      variant="error"
      title={error.title}
      focusOnMount
    >
      {error.message}
    </PageNotice>
  ) : null;

interface ApplyLeaveFooterProps {
  onClose: () => void;
  submitting: boolean;
  canSubmit: boolean;
}

interface ApplyLeaveHolidayStatusProps {
  loading: boolean;
  failure: string | null;
  onRetry?: () => void;
}

export const ApplyLeaveHolidayStatus = ({
  loading,
  failure,
  onRetry,
}: ApplyLeaveHolidayStatusProps) => {
  if (loading) {
    return (
      <PageNotice variant="info" title="Checking holidays">
        Holiday dates are loading. You can complete the form while this finishes.
      </PageNotice>
    );
  }
  if (!failure) return null;
  return (
    <PageNotice
      variant="error"
      title="Holiday dates could not be loaded"
      action={
        onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    >
      {failure} Leave cannot be submitted until holiday dates are available.
    </PageNotice>
  );
};

export const ApplyLeaveFooter = ({ onClose, submitting, canSubmit }: ApplyLeaveFooterProps) => (
  <>
    <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
      Cancel
    </Button>
    <Button
      type="submit"
      form="apply-leave-form"
      variant="primary"
      disabled={!canSubmit}
      busy={submitting}
      busyLabel="Submitting leave application…"
    >
      Submit Application
    </Button>
  </>
);
