import { canAccessTenantPath, type NavAccessOptions } from '../auth/navAccess';

export const normalizeInternalActionUrl = (url: string | null | undefined) => {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
};

export function authorizedNotificationActionUrl(
  url: string | null | undefined,
  access: NavAccessOptions
): string | null {
  const destination = normalizeInternalActionUrl(url);
  if (!destination) return null;

  const { pathname } = new URL(destination, window.location.origin);
  return canAccessTenantPath(pathname, access) ? destination : null;
}

export const notificationActionDestination = (url: string | null | undefined) =>
  normalizeInternalActionUrl(url) ?? '/notifications';

export const directNotificationActionUrl = (url: string | null | undefined) => {
  const destination = normalizeInternalActionUrl(url);
  return destination && destination !== '/' ? destination : '/notifications';
};
