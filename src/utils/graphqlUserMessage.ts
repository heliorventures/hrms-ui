import { ClientError } from 'graphql-request';

/** Maps GraphQL / DB-ish errors to short copy suitable for end users. */
export function graphQlUserMessage(err: unknown): string {
  let raw = '';
  if (err instanceof ClientError) {
    const msgs = err.response.errors?.map((e) => e.message).filter(Boolean) ?? [];
    raw = msgs.join(' ').trim() || err.message;
  } else if (err instanceof Error) {
    raw = err.message;
  } else {
    return 'Something went wrong. Please try again.';
  }

  const s = raw.trim();
  const lower = s.toLowerCase();

  if (
    lower.includes('duplicate key') ||
    lower.includes('unique constraint') ||
    lower.includes('already exists')
  ) {
    return 'This record already exists or conflicts with an existing value.';
  }
  if (lower.includes('foreign key') || lower.includes('violates foreign key constraint')) {
    return 'That reference is invalid or the related record was removed.';
  }
  if (
    lower.includes('sqlx') ||
    lower.includes('postgres') ||
    lower.includes('deadlock') ||
    lower.includes('connection refused') ||
    lower.includes('pool timed out')
  ) {
    return 'We could not complete this action right now. Please try again in a moment.';
  }
  if (lower.includes('permission') || lower.includes('forbidden') || lower.includes('not authorized')) {
    return 'You do not have permission to do this.';
  }
  if (lower.includes('not found') || lower.includes('does not exist')) {
    return 'The item you were updating could not be found. Refresh and try again.';
  }

  if (s.length > 220) {
    return 'Something went wrong. Please check your input and try again.';
  }
  return s;
}
