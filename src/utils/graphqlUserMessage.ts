import { ClientError } from 'graphql-request';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

function codeToMessage(code: string): string | null {
  switch (code.toUpperCase()) {
    case 'BAD_USER_INPUT':
    case 'VALIDATION_ERROR':
    case 'INVALID_JSON':
      return 'Check the entered details and try again.';
    case 'CONFLICT':
      return 'This record conflicts with an existing value.';
    case 'FORBIDDEN':
      return 'You do not have permission to do this.';
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
    lower.includes('duplicate key') ||
    lower.includes('unique constraint') ||
    lower.includes('already exists')
  ) {
    return 'This record conflicts with an existing value.';
  }
  if (lower.includes('foreign key') || lower.includes('violates foreign key constraint')) {
    return 'That reference is invalid or the related record was removed.';
  }
  if (lower.includes('permission') || lower.includes('forbidden') || lower.includes('not authorized')) {
    return 'You do not have permission to do this.';
  }
  if (lower.includes('unauthenticated') || lower.includes('unauthorised') || lower.includes('unauthorized')) {
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
      const code = item.extensions?.code;
      return typeof code === 'string' && code.length > 0;
    })?.extensions?.code;
    if (typeof graphqlCode === 'string') return graphqlCode;
  }

  if (err !== null && typeof err === 'object' && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === 'string') return code;
  }
  return null;
}

export function graphQlUserMessage(err: unknown): string {
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
