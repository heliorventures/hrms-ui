import type { FlashToastState } from '../../hooks/useFlashToast';

import FeedbackToast from './FeedbackToast';

const FlashToastBar = ({
  toast,
  onDismiss,
}: {
  toast: FlashToastState | null;
  onDismiss: () => void;
}) => {
  if (!toast) return null;
  return (
    <FeedbackToast variant={toast.variant} onDismiss={onDismiss} eventKey={toast}>
      {toast.text}
    </FeedbackToast>
  );
};

export default FlashToastBar;
