import type { useGraphClient } from '../../../hooks/useGraphClient';

import type {
  ApplyBalanceRow,
  ApplyHolidayRow,
  ApplyLeavePolicyRow,
  ApplyLeaveTypeOption,
} from './applyLeavePolicy';
import { leaveFieldHandlers } from './leaveFieldHandlers';
import { useApplyLeaveDialogOwnership } from './useApplyLeaveDialogOwnership';
import { useApplyLeaveFields } from './useApplyLeaveFields';
import { useApplyLeaveSelection } from './useApplyLeaveSelection';
import { useApplyLeaveSubmission } from './useApplyLeaveSubmission';

export interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveTypes: ApplyLeaveTypeOption[];
  leavePolicies: ApplyLeavePolicyRow[];
  upcomingHolidays: ApplyHolidayRow[];
  upcomingHolidaysLoading?: boolean;
  upcomingHolidaysFailure?: string | null;
  onRetryUpcomingHolidays?: () => void;
  leaveBalances: ApplyBalanceRow[];
  onSubmitted: () => void;
}

export const useApplyLeaveForm = (
  props: ApplyLeaveModalProps,
  client: ReturnType<typeof useGraphClient>
) => {
  const ownership = useApplyLeaveDialogOwnership(client, props.isOpen);
  const fields = useApplyLeaveFields(props.onClose, ownership);
  const selection = useApplyLeaveSelection(props, fields);
  const submission = useApplyLeaveSubmission(props, fields, selection, ownership);
  const visibleFormError =
    fields.formError?.context === ownership.dialogContext ? fields.formError : null;
  return {
    ...fields,
    ...selection,
    ...submission,
    ...leaveFieldHandlers(props.leaveTypes, fields),
    visibleFormError,
  };
};

export type ApplyLeaveOwnership = ReturnType<
  typeof useApplyLeaveDialogOwnership<ReturnType<typeof useGraphClient>>
>;
