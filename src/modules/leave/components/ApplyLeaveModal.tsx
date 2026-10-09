import Button from '../../../components/common/Button';
import FeedbackToast from '../../../components/common/FeedbackToast';
import Modal from '../../../components/common/Modal';
import type { useGraphClient } from '../../../hooks/useGraphClient';

import ApplyLeaveDiscardNotice, {
  ApplyLeaveFooter,
  ApplyLeaveFormFailure,
  ApplyLeaveHolidayStatus,
} from './ApplyLeaveDialogContent';
import ApplyLeaveFormFields from './ApplyLeaveFormFields';
import { ApplyLeaveContextPanel } from './ApplyLeaveSupportingInfo';
import { useApplyLeaveOwner } from './useApplyLeaveDialogOwnership';
import { useApplyLeaveForm, type ApplyLeaveModalProps } from './useApplyLeaveForm';

export type {
  ApplyBalanceRow,
  ApplyHolidayRow,
  ApplyLeavePolicyRow,
  ApplyLeaveTypeOption,
} from './applyLeavePolicy';
const ApplyLeaveModalForm = ({
  client,
  ...props
}: ApplyLeaveModalProps & { client: ReturnType<typeof useGraphClient> }) => {
  const {
    isOpen,
    leaveTypes,
    upcomingHolidaysLoading = false,
    upcomingHolidaysFailure = null,
    onRetryUpcomingHolidays,
  } = props;
  const form = useApplyLeaveForm(props, client);
  const supportingInformation = (
    <ApplyLeaveContextPanel
      balance={form.balanceForType}
      leaveType={form.selectedType}
      policy={form.policyForType}
      requiresDocument={form.requiresDocument}
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={form.handleClose}
      title="Apply For Leave"
      size="lg"
      isDismissible={!form.submitting}
      footer={
        <ApplyLeaveFooter
          onClose={form.handleClose}
          submitting={form.submitting}
          canSubmit={
            leaveTypes.length > 0 &&
            !upcomingHolidaysLoading &&
            !upcomingHolidaysFailure &&
            form.requestedDays != null &&
            !form.previewLoading &&
            !form.previewError
          }
        />
      }
    >
      <form
        id="apply-leave-form"
        ref={form.formRef}
        onSubmit={(event) => void form.handleSubmit(event)}
        className="space-y-4"
        autoComplete="off"
        noValidate
      >
        {form.confirmDiscard ? (
          <ApplyLeaveDiscardNotice
            onKeepEditing={() => {
              form.clearDiscard();
              form.focusField('reason');
            }}
            onDiscard={form.handleDiscard}
            submitting={form.submitting}
          />
        ) : null}
        <ApplyLeaveFormFailure error={form.visibleFormError} />
        {form.previewLoading ? (
          <p role="status" className="text-sm">
            Calculating chargeable dates...
          </p>
        ) : null}
        {form.previewError ? (
          <FeedbackToast
            variant={'error'}
            messageKey={form.previewError}
            action={
              <>
                <Button type="button" variant="outline" onClick={form.retryPreview}>
                  Retry Calculation
                </Button>
              </>
            }
          >
            {form.previewError}{' '}
          </FeedbackToast>
        ) : null}
        {form.requestedDays != null ? (
          <p className="text-sm">
            Chargeable leave: {form.requestedDays} day(s), using your location's working calendar.
          </p>
        ) : null}
        <ApplyLeaveHolidayStatus
          loading={upcomingHolidaysLoading}
          failure={upcomingHolidaysFailure}
          onRetry={onRetryUpcomingHolidays}
        />

        <ApplyLeaveFormFields
          leaveTypeId={form.leaveTypeId}
          leaveTypeOptions={form.leaveTypeOptions}
          onLeaveTypeChange={form.handleLeaveTypeChange}
          supportingInformation={supportingInformation}
          fromDate={form.fromDate}
          onFromDateChange={form.handleFromDateChange}
          toDate={form.toDate}
          onToDateChange={form.handleToDateChange}
          halfDayAllowed={form.halfDayAllowed}
          halfDayEligible={form.halfDayEligible}
          isHalfDay={form.isHalfDay}
          onHalfDayChange={form.handleHalfDayChange}
          halfDaySession={form.halfDaySession}
          onHalfDaySessionChange={form.handleHalfDaySessionChange}
          reason={form.reason}
          onReasonChange={form.handleReasonChange}
          requiresDocument={form.requiresDocument}
          supportingDocumentFile={form.supportingDocumentFile}
          onSupportingDocumentFileChange={form.handleSupportingDocumentChange}
          fieldErrors={form.fieldErrors}
        />
      </form>
    </Modal>
  );
};

const ApplyLeaveModal = (props: ApplyLeaveModalProps) => {
  const owner = useApplyLeaveOwner();
  return <ApplyLeaveModalForm key={owner.revision} client={owner.client} {...props} />;
};
export default ApplyLeaveModal;
