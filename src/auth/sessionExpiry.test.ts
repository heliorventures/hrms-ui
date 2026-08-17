import { GraphQLError } from 'graphql';
import { ClientError } from 'graphql-request';
import { describe, expect, it } from 'vitest';

import {
  CLIENT_SESSION_EXPIRED_MESSAGE,
  endExpiredClientSession,
  handleGraphResponse,
  isUnauthenticatedGraphResponse,
} from './sessionExpiry';

function clientError(status: number, code?: string): ClientError {
  return new ClientError(
    {
      status,
      errors: code
        ? [new GraphQLError('Request rejected', { extensions: { code } })]
        : undefined,
    },
    { query: 'query SessionProbe { __typename }' }
  );
}

describe('client session expiry', () => {
  it('classifies GraphQL UNAUTHENTICATED as session expiry', () => {
    expect(isUnauthenticatedGraphResponse(clientError(200, 'UNAUTHENTICATED'))).toBe(true);
  });

  it('classifies HTTP 401 as session expiry', () => {
    expect(isUnauthenticatedGraphResponse(clientError(401))).toBe(true);
  });

  it('does not classify forbidden or network failures as session expiry', () => {
    expect(isUnauthenticatedGraphResponse(clientError(403, 'FORBIDDEN'))).toBe(false);
    expect(isUnauthenticatedGraphResponse(new Error('network unavailable'))).toBe(false);
  });

  it('notifies only the tenant GraphQL plane about expiry', () => {
    let notifications = 0;
    const notify = () => {
      notifications += 1;
    };
    const unauthenticated = clientError(200, 'UNAUTHENTICATED');

    handleGraphResponse('operator', unauthenticated, notify);
    handleGraphResponse('client', unauthenticated, notify);

    expect(notifications).toBe(1);
  });

  it('clears an authenticated tenant and reports the expiry notice', () => {
    let clearedTenantId: string | null = null;
    let reportedMessage: string | null = null;

    const transitioned = endExpiredClientSession(
      'e6d4fc13-feb8-52a0-93bd-f66c795969b1',
      (tenantId) => {
        clearedTenantId = tenantId;
      },
      (message) => {
        reportedMessage = message;
      }
    );

    expect(transitioned).toBe(true);
    expect(clearedTenantId).toBe('e6d4fc13-feb8-52a0-93bd-f66c795969b1');
    expect(reportedMessage).toBe(CLIENT_SESSION_EXPIRED_MESSAGE);
  });

  it('does not report expiry when no tenant is authenticated', () => {
    let stateChanged = false;

    const transitioned = endExpiredClientSession(
      null,
      () => {
        stateChanged = true;
      },
      () => {
        stateChanged = true;
      }
    );

    expect(transitioned).toBe(false);
    expect(stateChanged).toBe(false);
  });
});
