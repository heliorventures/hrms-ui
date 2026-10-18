import Button from '../../../components/common/Button';
import FeedbackToast from '../../../components/common/FeedbackToast';
import FileInput from '../../../components/common/FileInput';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Textarea from '../../../components/common/Textarea';
import { useTravelSubmission } from '../hooks/useTravelSubmission';

import TravelRouteFields from './TravelRouteFields';

interface SubmitTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const SubmitTravelModal = (props: SubmitTravelModalProps) => {
  const { isOpen } = props;
  const form = useTravelSubmission(props);
  const {
    formData,
    submitError,
    submitting,
    inputKey,
    setFile,
    close,
    handleSubmit,
    handleChange,
  } = form;
  return (
    <Modal
      isOpen={isOpen}
      isDismissible={!submitting}
      onClose={close}
      title="Submit Travel Request"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {submitError && (
          <FeedbackToast variant={'error'} messageKey={submitError}>
            {submitError}
          </FeedbackToast>
        )}

        <TravelRouteFields form={form} />

        <Input
          label="Estimated Cost (₹)"
          type="number"
          name="estimatedCost"
          value={formData.estimatedCost}
          onChange={handleChange}
          min="0"
          step="0.01"
          disabled={submitting}
          required
          fullWidth
        />

        <Textarea
          id="travel-purpose"
          label="Purpose of travel"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          rows={3}
          disabled={submitting}
          required
          fullWidth
        />

        <FileInput
          label="Supporting file"
          description="Required. PDF, JPG, or PNG up to 6 MB."
          key={inputKey}
          accept="application/pdf,image/jpeg,image/png"
          required
          disabled={submitting}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Creates a <strong>pending travel request</strong>. When your tenant configures a{' '}
          <span className="font-mono">TRAVEL_REQUEST</span> workflow, approval follows{' '}
          <strong>manager first</strong>, then designated roles such as <strong>accounting</strong>{' '}
          (fallback single-step routing still applies without a workflow).
        </p>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
          <Button type="button" variant="outline" onClick={close} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitTravelModal;
