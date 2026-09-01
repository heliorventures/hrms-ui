import { useEffect } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';

import type { RouteContentOutletContext } from '../components/layout/routeFocus';
import { APP_BRAND } from '../constants/brand';

export type RouteState =
  | 'loading'
  | 'unavailable'
  | 'organization-not-found'
  | 'access-denied'
  | 'not-found'
  | 'unexpected';

interface RouteStatePageBaseProps {
  onRetry?: () => void;
  returnTo?: string;
  returnLabel?: string;
  statusLabel?: string;
  retryExhausted?: boolean;
}

type AccessDeniedRecovery =
  | { onRetry: () => void; returnTo?: string }
  | { onRetry?: () => void; returnTo: string };

type RouteStatePageProps =
  | (RouteStatePageBaseProps & { state: Exclude<RouteState, 'access-denied'> })
  | (RouteStatePageBaseProps & { state: 'access-denied' } & AccessDeniedRecovery);

interface RouteStateContent {
  heading: string;
  message: string;
  title?: string;
  role: 'alert' | 'status';
  live: 'assertive' | 'polite';
}

const STATE_CONTENT: Record<RouteState, RouteStateContent> = {
  loading: {
    heading: 'Opening page',
    role: 'status',
    live: 'polite',
    message: 'Loading this page…',
  },
  unavailable: {
    heading: 'Organization unavailable',
    title: 'Organization unavailable',
    role: 'alert',
    live: 'assertive',
    message: 'We could not open your organization workspace right now.',
  },
  'organization-not-found': {
    heading: 'Organization not found',
    title: 'Organization not found',
    role: 'alert',
    live: 'assertive',
    message: 'Check the organization link and try again, or contact your administrator.',
  },
  'access-denied': {
    heading: 'Access denied',
    title: 'Access denied',
    role: 'alert',
    live: 'assertive',
    message: 'You do not have access to this page.',
  },
  'not-found': {
    heading: 'Page not found',
    title: 'Page not found',
    role: 'status',
    live: 'polite',
    message: 'We could not find the page you requested.',
  },
  unexpected: {
    heading: 'Page unavailable',
    title: 'Page unavailable',
    role: 'alert',
    live: 'assertive',
    message: 'This page could not be opened. Try again.',
  },
};

function availableRetryAction(
  onRetry: (() => void) | undefined,
  retryExhausted: boolean
): (() => void) | undefined {
  if (retryExhausted) return undefined;
  return onRetry;
}

function routeStateMessage(
  state: RouteState,
  content: RouteStateContent,
  retryExhausted: boolean
): string {
  if (state === 'unavailable' && retryExhausted) {
    return 'We could not open your organization workspace. Try again later or contact your administrator.';
  }
  return content.message;
}

const RouteStatePage = ({
  state,
  onRetry,
  returnTo,
  returnLabel = 'Return to a safe page',
  statusLabel,
  retryExhausted = false,
}: RouteStatePageProps) => {
  const content = STATE_CONTENT[state];
  const loading = state === 'loading';
  const retryAction = availableRetryAction(onRetry, retryExhausted);
  const message = routeStateMessage(state, content, retryExhausted);
  const location = useLocation();
  const outletContext = useOutletContext<RouteContentOutletContext | undefined>();
  const onRouteStateCommit = outletContext?.onRouteStateCommit;

  useEffect(() => {
    if (loading || !content.title) return;
    document.title = `${content.title} | ${APP_BRAND.productName}`;
    onRouteStateCommit?.({
      locationKey: location.key,
      pathname: location.pathname,
    });
  }, [content.title, loading, location.key, location.pathname, onRouteStateCommit]);

  return (
    <section
      role={content.role}
      aria-label={loading ? statusLabel : undefined}
      aria-labelledby={loading && statusLabel ? undefined : `route-state-${state}`}
      aria-live={content.live}
      className="mx-auto flex min-h-64 max-w-xl items-center justify-center px-4 py-10 text-center"
    >
      <div className="w-full rounded-xl border border-line bg-surface p-6 shadow-card">
        <h1 id={`route-state-${state}`} className="text-xl font-semibold text-content-primary">
          {content.heading}
        </h1>
        <p className="mt-2 break-words text-sm text-content-secondary">{message}</p>
        {!loading && (retryAction || returnTo) ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {retryAction ? (
              <button
                type="button"
                onClick={retryAction}
                className="min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-content-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Try again
              </button>
            ) : null}
            {returnTo ? (
              <Link
                to={returnTo}
                className="inline-flex min-h-11 items-center rounded-md border border-line px-4 py-2 text-sm font-semibold text-content-primary hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {returnLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default RouteStatePage;
