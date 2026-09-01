import { describe, expect, it } from 'vitest';

import { AuthError } from './authClient';
import { authUserMessage, type AuthMessageContext } from './authUserMessage';

const NETWORK_MESSAGE = 'The sign-in service is unavailable right now. Try again.';
const TENANT_LOGIN_FALLBACK = 'We could not sign you in. Try again.';
const TENANT_RESOLUTION_FALLBACK = 'We could not open this organization right now. Try again.';

describe('authUserMessage', () => {
  it('uses tenant-safe credential copy for an unauthenticated tenant login', () => {
    const error = new AuthError(
      401,
      'UNAUTHENTICATED',
      'password rejected by https://auth.internal/graphql'
    );

    expect(authUserMessage(error, 'tenant-login')).toBe('Username or password is incorrect.');
  });

  it('uses operator-safe credential copy for an unauthenticated operator login', () => {
    const error = new AuthError(401, 'UNAUTHENTICATED', 'user@example.com does not exist');

    expect(authUserMessage(error, 'operator-login')).toBe('Email or password is incorrect.');
  });

  it('classifies tenant-not-found from a structured auth code without exposing its message', () => {
    const error = new AuthError(
      500,
      'TENANT_NOT_FOUND',
      'tenant secret-org missing in kabipay-auth'
    );

    expect(authUserMessage(error, 'tenant-resolution')).toBe(
      'We could not find this organization.'
    );
  });

  it.each([
    new AuthError(404, 'UNKNOWN', 'GET /auth/client/tenants/secret returned HTTP 404'),
    { status: 404, message: 'https://auth.internal returned HTTP 404' },
    { response: { status: 404 }, message: 'GraphQL transport failed' },
  ])('classifies structured HTTP 404 shapes during tenant resolution', (error) => {
    expect(authUserMessage(error, 'tenant-resolution')).toBe(
      'We could not find this organization.'
    );
  });

  it('does not turn an HTTP 404 into organization enumeration copy during login', () => {
    const error = new AuthError(404, 'UNKNOWN', 'account was not found');

    expect(authUserMessage(error, 'tenant-login')).toBe(TENANT_LOGIN_FALLBACK);
  });

  it.each<AuthMessageContext>(['tenant-login', 'operator-login', 'tenant-resolution'])(
    'classifies TypeError as a network failure for %s',
    (context) => {
      const error = new TypeError('fetch https://auth.internal failed');

      expect(authUserMessage(error, context)).toBe(NETWORK_MESSAGE);
    }
  );

  it.each([
    new DOMException('request aborted at https://auth.internal', 'AbortError'),
    Object.assign(new Error('socket timed out'), { name: 'TimeoutError' }),
    { code: 'ETIMEDOUT', message: 'connect ETIMEDOUT auth.internal:443' },
    { status: 408, message: 'HTTP 408 from gateway' },
    { response: { status: 504 }, message: 'HTTP 504 from gateway' },
  ])('classifies structured abort and timeout failures', (error) => {
    expect(authUserMessage(error, 'tenant-resolution')).toBe(NETWORK_MESSAGE);
  });

  it('uses context-specific fallbacks for unknown input', () => {
    expect(authUserMessage(undefined, 'tenant-login')).toBe(TENANT_LOGIN_FALLBACK);
    expect(authUserMessage(null, 'operator-login')).toBe(TENANT_LOGIN_FALLBACK);
    expect(authUserMessage(42, 'tenant-resolution')).toBe(TENANT_RESOLUTION_FALLBACK);
  });

  it('fails closed when an AuthError has a runtime-malformed non-string code', () => {
    const malformedError = new AuthError(401, 'UNAUTHENTICATED', 'private server detail');
    (malformedError as unknown as { code: unknown }).code = {
      raw: 'UNAUTHENTICATED https://auth.internal',
    };

    expect(authUserMessage(malformedError, 'tenant-login')).toBe(TENANT_LOGIN_FALLBACK);
  });

  it('fails closed when adjacent structured fields throw during inspection', () => {
    const throwingAuthError = new AuthError(500, 'UNKNOWN', 'private server detail');
    Object.defineProperties(throwingAuthError, {
      code: {
        get: () => {
          throw new Error('code getter leaked');
        },
      },
      status: {
        get: () => {
          throw new Error('status getter leaked');
        },
      },
    });
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();

    expect(authUserMessage(throwingAuthError, 'tenant-resolution')).toBe(
      TENANT_RESOLUTION_FALLBACK
    );
    expect(authUserMessage(proxy, 'operator-login')).toBe(TENANT_LOGIN_FALLBACK);
  });

  it('never trusts raw message text as structured classification or rendered copy', () => {
    const rawError = new Error(
      'UNAUTHENTICATED TENANT_NOT_FOUND https://auth.internal GraphQL HTTP 404\n' +
        'at login (C:\\service\\auth.ts:10:5)'
    );

    const outputs = [
      authUserMessage(rawError, 'tenant-login'),
      authUserMessage(rawError, 'operator-login'),
      authUserMessage(rawError, 'tenant-resolution'),
    ];

    expect(outputs).toEqual([
      TENANT_LOGIN_FALLBACK,
      TENANT_LOGIN_FALLBACK,
      TENANT_RESOLUTION_FALLBACK,
    ]);
    expect(outputs.join(' ')).not.toMatch(
      /auth\.internal|GraphQL|HTTP|TENANT_NOT_FOUND|UNAUTHENTICATED|service\\auth\.ts/i
    );
  });
});
