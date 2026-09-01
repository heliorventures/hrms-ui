import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';

import { APP_BRAND } from '../constants/brand';
import type { RouteContentOutletContext } from '../components/layout/routeFocus';

import RouteErrorBoundary from './RouteErrorBoundary';
import RouteStatePage from './RouteStatePage';
import type { RoutePage } from './routeTypes';

interface RouteContentProps {
  title: string;
  load: RoutePage['load'];
  returnTo?: string;
  returnLabel?: string;
}

interface RouteCommitMarkerProps {
  children: ReactNode;
  locationKey: string;
  pathname: string;
  onCommit?: RouteContentOutletContext['onRouteContentCommit'];
}

interface LazyPageCacheEntry {
  pathname: string;
  attempts: Map<number, LazyExoticComponent<ComponentType>>;
}

const lazyPageCache = new WeakMap<RoutePage['load'], LazyPageCacheEntry>();

const getLazyPage = (load: RoutePage['load'], pathname: string, loadAttempt: number) => {
  let entry = lazyPageCache.get(load);
  if (!entry || entry.pathname !== pathname) {
    entry = { pathname, attempts: new Map() };
    lazyPageCache.set(load, entry);
  }

  let page = entry.attempts.get(loadAttempt);
  if (!page) {
    page = lazy(load);
    entry.attempts.set(loadAttempt, page);
  }
  return page;
};

const RouteCommitMarker = ({
  children,
  locationKey,
  pathname,
  onCommit,
}: RouteCommitMarkerProps) => {
  useEffect(() => {
    onCommit?.({ locationKey, pathname });
  }, [locationKey, onCommit, pathname]);

  return children;
};

const RouteContent = ({ title, load, returnTo, returnLabel }: RouteContentProps) => {
  const [loadAttempt, setLoadAttempt] = useState(0);
  const location = useLocation();
  const outletContext = useOutletContext<RouteContentOutletContext | undefined>();
  const LazyPage = useMemo(
    () => getLazyPage(load, location.pathname, loadAttempt),
    [load, loadAttempt, location.pathname]
  );

  useEffect(() => {
    document.title = `${title} | ${APP_BRAND.productName}`;
  }, [loadAttempt, location.pathname, title]);

  return (
    <RouteErrorBoundary
      onRetry={() => {
        lazyPageCache.delete(load);
        setLoadAttempt((attempt) => attempt + 1);
      }}
      returnTo={returnTo}
      returnLabel={returnLabel}
    >
      <Suspense
        fallback={<RouteStatePage state="loading" statusLabel={`Loading ${title}`} />}
      >
        <RouteCommitMarker
          locationKey={location.key}
          pathname={location.pathname}
          onCommit={outletContext?.onRouteContentCommit}
        >
          <LazyPage />
        </RouteCommitMarker>
      </Suspense>
    </RouteErrorBoundary>
  );
};

export default RouteContent;
