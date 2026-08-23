import { GraphQLError } from 'graphql';
import { ClientError } from 'graphql-request';
import { describe, expect, it } from 'vitest';

import {
  CLIENT_SESSION_EXPIRED_MESSAGE,
  OPERATOR_SESSION_EXPIRED_MESSAGE,
  endExpiredClientSession,
  endExpiredOperatorSession,
  handleGraphResponse,
  isUnauthenticatedGraphResponse,
} from './sessionExpiry';

function clientError(status: number, code?: string): ClientError {
  return new ClientError(
    {
      status,
      errors: code ? [new GraphQLError('Request rejected', { extensions: { code } })] : undefined,
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

  it('notifies each GraphQL plane through its supplied expiry callback', () => {
    let clientNotifications = 0;
    let operatorNotifications = 0;
    const unauthenticated = clientError(200, 'UNAUTHENTICATED');

    handleGraphResponse('client', unauthenticated, () => {
      clientNotifications += 1;
    });
    handleGraphResponse('operator', unauthenticated, () => {
      operatorNotifications += 1;
    });

    expect(clientNotifications).toBe(1);
    expect(operatorNotifications).toBe(1);
  });

  it('reports every repeated unauthenticated response to the plane callback', () => {
    let notifications = 0;
    const notify = () => {
      notifications += 1;
    };
    const unauthenticated = clientError(401);

    handleGraphResponse('operator', unauthenticated, notify);
    handleGraphResponse('operator', unauthenticated, notify);

    expect(notifications).toBe(2);
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

  it('clears only local operator state and reports the operator expiry notice', () => {
    let clears = 0;
    let reportedMessage: string | null = null;

    endExpiredOperatorSession(
      () => {
        clears += 1;
      },
      (message) => {
        reportedMessage = message;
      }
    );

    expect(clears).toBe(1);
    expect(reportedMessage).toBe(OPERATOR_SESSION_EXPIRED_MESSAGE);
  });
});
