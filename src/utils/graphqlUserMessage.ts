import { ClientError } from 'graphql-request';

const FALLBACK_MESSAGE = 'We could not complete this action. Try again.';

function codeToMessage(code: string): string | null {
  switch (code.toUpperCase()) {
    case 'BAD_USER_INPUT':
    case 'VALIDATION_ERROR':
    case 'INVALID_JSON':
      return 'Check the entered details and try again.';
    case 'CURRENT_PASSWORD_INCORRECT':
      return 'The current password is incorrect.';
    case 'PASSWORD_REUSE_NOT_ALLOWED':
      return 'New password must be different from the current password.';
    case 'LEAVE_DATE_OVERLAP':
      return 'An active leave request already covers all or part of those dates.';
    case 'LEAVE_POLICY_DUPLICATE':
      return 'Only one leave policy can be configured for each leave type.';
    case 'EXPENSE_CLAIM_LIMIT_EXCEEDED':
      return 'Amount exceeds the permitted category limit. Review the limit shown above.';
    case 'EXPENSE_MONTHLY_LIMIT_EXCEEDED':
      return 'This claim would exceed the monthly category limit.';
    case 'ASSET_CATEGORY_CODE_CONFLICT':
      return 'An asset category already uses this code. Choose a different code and try again.';
    case 'ASSET_TAG_CONFLICT':
      return 'An asset already uses this asset tag. Choose a different tag and try again.';
    case 'ASSET_SERIAL_NUMBER_CONFLICT':
      return 'An asset already uses this serial number. Check the existing inventory record.';
    case 'ASSET_ACTIVE_ALLOCATION_CONFLICT':
    case 'ASSET_ALLOCATION_CONFLICT':
      return 'This asset is already assigned. Refresh the inventory before trying again.';
    case 'ASSET_RETURN_CONFLICT':
      return 'This assignment has already been returned. Refresh the allocation history.';
    case 'ASSET_CATEGORY_IN_USE':
      return 'Retire or move the remaining active assets before retiring this category.';
    case 'ASSET_NOT_AVAILABLE':
      return 'This asset is no longer available. Refresh the inventory and choose another asset.';
    case 'ASSET_RETIRED':
      return 'This asset is retired and cannot be changed or assigned.';
    case 'ASSET_EMPLOYEE_INACTIVE':
      return 'This employee is no longer active. Choose an active employee.';
    case 'COMPANY_DOCUMENT_UPLOAD_EXPIRED':
      return 'This upload expired. Upload the file again.';
    case 'COMPANY_DOCUMENT_UPLOAD_CLAIMED':
      return 'This upload was already used. Upload the file again.';
    case 'COMPANY_DOCUMENT_UPLOAD_INVALID':
      return 'This staged upload is not valid for this company document.';
    case 'CONFLICT':
      return 'This information conflicts with an existing record. Review the details and try again.';
    case 'FORBIDDEN':
      return 'You do not have access to make this change. Contact your HR administrator if you need help.';
    case 'UNAUTHENTICATED':
      return 'Your session has expired. Sign in again.';
    case 'NOT_FOUND':
    case 'TENANT_NOT_FOUND':
      return 'The requested record could not be found.';
    case 'MODULE_NOT_SUBSCRIBED':
      return 'This feature is not enabled for your organization.';
    case 'SEAT_LIMIT_REACHED':
      return 'The seat limit has been reached for this feature.';
    case 'TENANT_SUSPENDED':
      return 'This organization workspace is not active.';
    case 'TENANT_DATABASE_UNAVAILABLE':
      return 'This organization workspace is temporarily unavailable. Please try again shortly.';
    case 'DATABASE_ERROR':
    case 'INTERNAL_ERROR':
      return 'We could not complete this action right now. Please try again in a moment.';
    default:
      return null;
  }
}

function rawTextToMessage(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('networkerror') ||
    lower.includes('connection refused')
  ) {
    return 'We could not connect right now. Check your connection and try again.';
  }
  if (lower.includes('timed out') || lower.includes('timeout')) {
    return 'This is taking longer than expected. Try again.';
  }
  if (lower.includes('workdate cannot be in the future') || lower.includes('future attendance')) {
    return 'Future attendance cannot be regularized.';
  }
  if (
    lower.includes('checkintime must be before checkouttime') ||
    lower.includes('punch in must be before punch out')
  ) {
    return 'Punch In must be before Punch Out for the same calendar day.';
  }
  if (lower.includes('manual attendance overlaps') || lower.includes('punch range overlaps')) {
    return 'This punch range overlaps an existing attendance segment for the day.';
  }
  if (lower.includes('complete the open punch before adjusting manual attendance')) {
    return 'Complete the open punch before adjusting attendance for this day.';
  }
  if (lower.includes('total attendance for a day cannot exceed 24 hours')) {
    return 'Total attendance for a day cannot exceed 24 hours.';
  }
  if (lower.includes('manual attendance is limited to the last')) {
    return 'This date is outside the self-service attendance adjustment window. Contact HR to regularize it.';
  }
  if (lower.includes('daily timesheet') && lower.includes('24 hours')) {
    return 'Daily timesheet total cannot exceed 24 hours.';
  }
  if (lower.includes('weekly timesheet') && lower.includes('40 hours')) {
    return 'Weekly timesheet total cannot exceed 40 hours.';
  }
  if (
    lower.includes('pending or approved timesheet submission') ||
    lower.includes('already has a submission')
  ) {
    return 'This week is already submitted. Ask the approver to reject it before adding or editing entries.';
  }
  if (lower.includes('cannot approve or reject your own timesheet submission')) {
    return 'You cannot approve or reject your own timesheet submission.';
  }
  if (lower.includes('submitted timesheet rows cannot be edited')) {
    return 'This entry is already submitted. Ask the approver to reject the week before editing it.';
  }
  if (lower.includes('approved timesheet rows cannot be moved to another week')) {
    return 'Approved timesheet entries cannot be moved to another week.';
  }
  if (lower.includes('approved timesheet rows are locked')) {
    return 'Approved timesheet entries are locked by the tenant policy.';
  }
  if (lower.includes('approved or submitted timesheet rows cannot be edited')) {
    return 'This entry is already submitted. Ask the approver to reject the week before editing it.';
  }
  if (lower.includes('project is required')) {
    return 'Project is required.';
  }
  if (lower.includes('task type is required')) {
    return 'Task Type is required.';
  }
  if (
    lower.includes('duplicate key') ||
    lower.includes('unique constraint') ||
    lower.includes('already exists')
  ) {
    return 'This information conflicts with an existing record. Review the details and try again.';
  }
  if (lower.includes('foreign key') || lower.includes('violates foreign key constraint')) {
    return 'That reference is invalid or the related record was removed.';
  }
  if (
    lower.includes('permission') ||
    lower.includes('forbidden') ||
    lower.includes('not authorized')
  ) {
    return 'You do not have access to make this change. Contact your HR administrator if you need help.';
  }
  if (
    lower.includes('unauthenticated') ||
    lower.includes('unauthorised') ||
    lower.includes('unauthorized')
  ) {
    return 'Your session has expired. Sign in again.';
  }
  if (lower.includes('not found') || lower.includes('does not exist')) {
    return 'The requested record could not be found.';
  }
  if (
    lower.includes('sqlx') ||
    lower.includes('postgres') ||
    lower.includes('database') ||
    lower.includes('relation') ||
    lower.includes('deadlock') ||
    lower.includes('connection refused') ||
    lower.includes('pool timed out')
  ) {
    return 'We could not complete this action right now. Please try again in a moment.';
  }
  return FALLBACK_MESSAGE;
}

function errorCode(err: unknown): string | null {
  if (err instanceof ClientError) {
    const graphqlCode = err.response.errors?.find((item) => {
      const { code } = item.extensions;
      return typeof code === 'string' && code.length > 0;
    })?.extensions.code;
    if (typeof graphqlCode === 'string') return graphqlCode;
  }

  if (err !== null && typeof err === 'object' && 'code' in err) {
    const { code } = err as { code?: unknown };
    if (typeof code === 'string') return code;
  }
  return null;
}

export function graphQlUserMessage(err: unknown): string {
  if (err instanceof ClientError) {
    const code = errorCode(err);
    const normalizedCode = code?.toUpperCase();
    if (normalizedCode === 'VALIDATION_ERROR' || normalizedCode === 'FORBIDDEN') {
      const joined = err.response.errors?.map((item) => item.message).join(' ') ?? err.message;
      const mapped = rawTextToMessage(joined);
      if (mapped !== FALLBACK_MESSAGE) return mapped;
    }
    if (normalizedCode !== 'VALIDATION_ERROR') {
      const mapped = code ? codeToMessage(code) : null;
      if (mapped) return mapped;
    }
    const joined = err.response.errors?.map((item) => item.message).join(' ') ?? err.message;
    const mapped = rawTextToMessage(joined);
    if (mapped !== FALLBACK_MESSAGE) return mapped;
    if (normalizedCode === 'VALIDATION_ERROR') {
      return code ? (codeToMessage(code) ?? FALLBACK_MESSAGE) : FALLBACK_MESSAGE;
    }
  }

  const code = errorCode(err);
  if (code) {
    return codeToMessage(code) ?? FALLBACK_MESSAGE;
  }

  if (err instanceof ClientError) {
    const joined = err.response.errors?.map((item) => item.message).join(' ') ?? err.message;
    return rawTextToMessage(joined);
  }

  if (err instanceof Error) {
    return rawTextToMessage(err.message);
  }

  return FALLBACK_MESSAGE;
}

export const toUserMessage = graphQlUserMessage;
