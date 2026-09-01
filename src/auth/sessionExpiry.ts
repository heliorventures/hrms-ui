import { ClientError } from 'graphql-request';

export const CLIENT_SESSION_EXPIRED_MESSAGE = 'Your session expired. Sign in again.';
export const OPERATOR_SESSION_EXPIRED_MESSAGE = 'Your operator session expired. Sign in again.';

interface GraphResponseLike {
  status: number;
  errors?: ReadonlyArray<{
    extensions?: Readonly<Record<string, unknown>>;
  }>;
}

function graphResponse(response: GraphResponseLike | Error): GraphResponseLike | null {
  if (response instanceof ClientError) return response.response;
  if (response instanceof Error) return null;
  return response;
}

export function isUnauthenticatedGraphResponse(response: GraphResponseLike | Error): boolean {
  const result = graphResponse(response);
  if (!result) return false;
  if (result.status === 401) return true;
  return (
    result.errors?.some((error) => {
      const code = error.extensions?.code;
      return typeof code === 'string' && code.toUpperCase() === 'UNAUTHENTICATED';
    }) ?? false
  );
}

export function handleGraphResponse(
  plane: 'client' | 'operator',
  response: GraphResponseLike | Error,
  onUnauthenticated?: () => void
): void {
  if (!onUnauthenticated || !isUnauthenticatedGraphResponse(response)) return;
  switch (plane) {
    case 'client':
    case 'operator':
      onUnauthenticated();
  }
}

export function endExpiredClientSession(
  tenantId: string | null,
  clearSession: (tenantId: string) => void,
  reportError: (message: string) => void
): boolean {
  if (!tenantId) return false;
  clearSession(tenantId);
  reportError(CLIENT_SESSION_EXPIRED_MESSAGE);
  return true;
}

export function endExpiredOperatorSession(
  clearSession: () => void,
  reportError: (message: string) => void
): void {
  clearSession();
  reportError(OPERATOR_SESSION_EXPIRED_MESSAGE);
}
