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
