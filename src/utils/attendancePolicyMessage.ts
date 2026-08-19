export interface AttendancePolicyMessage {
  employee: string;
  regularizer?: string;
}

const DEFAULT_SELF_SERVICE_DAYS = 14;

export function attendancePolicyMessage(
  selfServiceDays: number,
  canRegularize: boolean
): AttendancePolicyMessage {
  const days =
    Number.isFinite(selfServiceDays) && selfServiceDays >= 0
      ? Math.floor(selfServiceDays)
      : DEFAULT_SELF_SERVICE_DAYS;
  const message: AttendancePolicyMessage = {
    employee: `You can add missed punches from the last ${days} calendar days. For an earlier date, ask HR or your manager to adjust your attendance.`,
  };

  if (canRegularize) {
    message.regularizer =
      'You can also adjust earlier dates because your role includes attendance regularization.';
  }

  return message;
}
