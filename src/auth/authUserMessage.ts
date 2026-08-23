import { AuthError } from './authClient';

export type AuthMessageContext = 'tenant-login' | 'operator-login' | 'tenant-resolution';

const NETWORK_MESSAGE = 'The sign-in service is unavailable right now. Try again.';
const LOGIN_FALLBACK = 'We could not sign you in. Try again.';
const TENANT_RESOLUTION_FALLBACK = 'We could not open this organization right now. Try again.';
const TENANT_NOT_FOUND_MESSAGE = 'We could not find this organization.';

const NETWORK_ERROR_NAMES = new Set(['ABORTERROR', 'TIMEOUTERROR']);
const NETWORK_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENETUNREACH',
  'ERR_NETWORK',
  'ETIMEDOUT',
  'NETWORK_ERROR',
  'REQUEST_TIMEOUT',
  'TIMEOUT',
]);
const TIMEOUT_HTTP_STATUSES = new Set([408, 504]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readProperty(value: unknown, key: string): unknown {
  if (!isRecord(value)) return undefined;
  try {
    return value[key];
  } catch {
    return undefined;
  }
}

function normalizedStringProperty(value: unknown, key: string): string | null {
  const property = readProperty(value, key);
  return typeof property === 'string' ? property.toUpperCase() : null;
}

function safelyMatchesInstance(
  value: unknown,
  constructor: typeof AuthError | TypeErrorConstructor
): boolean {
  try {
    return value instanceof constructor;
  } catch {
    return false;
  }
}

function httpStatus(error: unknown): number | null {
  const directStatus = readProperty(error, 'status');
  if (typeof directStatus === 'number') return directStatus;

  const responseStatus = readProperty(readProperty(error, 'response'), 'status');
  return typeof responseStatus === 'number' ? responseStatus : null;
}

function isNetworkOrTimeout(error: unknown): boolean {
  if (safelyMatchesInstance(error, TypeError)) return true;

  const name = normalizedStringProperty(error, 'name');
  if (name && NETWORK_ERROR_NAMES.has(name)) return true;

  const code = normalizedStringProperty(error, 'code');
  if (code && NETWORK_ERROR_CODES.has(code)) return true;

  const status = httpStatus(error);
  return status !== null && TIMEOUT_HTTP_STATUSES.has(status);
}

function authErrorCode(error: unknown): string | null {
  if (!safelyMatchesInstance(error, AuthError)) return null;
  return normalizedStringProperty(error, 'code');
}

export function authUserMessage(error: unknown, context: AuthMessageContext): string {
  const code = authErrorCode(error);

  if (context === 'tenant-login' && code === 'UNAUTHENTICATED') {
    return 'Username or password is incorrect.';
  }
  if (context === 'operator-login' && code === 'UNAUTHENTICATED') {
    return 'Email or password is incorrect.';
  }
  if (
    context === 'tenant-resolution' &&
    (code === 'TENANT_NOT_FOUND' || httpStatus(error) === 404)
  ) {
    return TENANT_NOT_FOUND_MESSAGE;
  }
  if (isNetworkOrTimeout(error)) return NETWORK_MESSAGE;
  return context === 'tenant-resolution' ? TENANT_RESOLUTION_FALLBACK : LOGIN_FALLBACK;
}
