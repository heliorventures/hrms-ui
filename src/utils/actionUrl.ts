export const normalizeInternalActionUrl = (url: string | null | undefined) => {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
};

export const notificationActionDestination = (url: string | null | undefined) =>
  normalizeInternalActionUrl(url) ?? '/notifications';

export const directNotificationActionUrl = (url: string | null | undefined) => {
  const internalUrl = normalizeInternalActionUrl(url);
  if (!internalUrl) return '/notifications';

  const pathname = internalUrl.split('#', 1)[0].split('?', 1)[0];
  return pathname === '/notifications' ? internalUrl : '/notifications';
};
