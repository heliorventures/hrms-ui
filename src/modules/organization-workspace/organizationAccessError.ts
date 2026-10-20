import { ClientError } from 'graphql-request';

export function organizationAccessDenied(error: unknown): boolean {
  if (!(error instanceof ClientError)) return false;
  return (
    error.response.errors?.some(
      (item) => item.extensions.code === 'FORBIDDEN' || item.extensions.code === 'UNAUTHENTICATED'
    ) ?? false
  );
}
