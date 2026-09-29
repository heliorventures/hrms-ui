import { type PropsWithChildren, useCallback, useMemo } from 'react';

import TourOverlay from './TourOverlay';
import { findTourForRoute } from './tourRegistry';
import type { TourContext, TourDefinition } from './tourTypes';
import { GuidanceContext, type GuidanceContextValue } from './useGuidance';
import { useTourController } from './useTourController';

type GuidanceProviderProps = PropsWithChildren<{
  matchedRoutePath: string | null;
  identityKey?: string | null;
  authorizationKey?: string | null;
  tourContext?: Omit<TourContext, 'routePath'>;
  overviewTour?: TourDefinition;
  onOverviewDismiss?: () => void | Promise<void>;
  onOverviewDismissError?: (error: unknown) => void;
  registeredTours?: readonly TourDefinition[];
}>;

export const GuidanceProvider = ({
  children,
  matchedRoutePath,
  identityKey = null,
  authorizationKey = null,
  tourContext,
  overviewTour,
  onOverviewDismiss,
  onOverviewDismissError,
  registeredTours,
}: GuidanceProviderProps) => {
  const pageTour = useMemo(
    () =>
      findTourForRoute(
        matchedRoutePath,
        {
          ...tourContext,
          routePath: matchedRoutePath,
        },
        registeredTours
      ),
    [matchedRoutePath, registeredTours, tourContext]
  );
  const contextKey = JSON.stringify([
    matchedRoutePath,
    identityKey,
    authorizationKey,
    tourContext?.hasEmployeeProfile,
    tourContext?.activeTab,
  ]);
  const { activeTour, returnFocusRef, closeTour, startTour } = useTourController({
    contextKey,
    tourContext,
    onOverviewDismiss,
    onOverviewDismissError,
  });
  const startPageTour = useCallback(() => {
    if (!pageTour) return false;
    return startTour(pageTour, 'page');
  }, [pageTour, startTour]);
  const startOverview = useCallback(
    (options: { persistDismissalOnClose?: boolean } = {}) => {
      if (!overviewTour || overviewTour.steps.length === 0) return false;
      return startTour(overviewTour, 'overview', options.persistDismissalOnClose ?? false);
    },
    [overviewTour, startTour]
  );
  const value = useMemo<GuidanceContextValue>(
    () => ({
      activeTour,
      isTourActive: activeTour !== null,
      hasPageTour: pageTour !== null,
      startPageTour,
      startOverview,
      closeTour,
    }),
    [activeTour, closeTour, pageTour, startOverview, startPageTour]
  );
  return (
    <GuidanceContext.Provider value={value}>
      {children}
      {activeTour ? (
        <TourOverlay
          key={`${activeTour.kind}:${activeTour.definition.id}`}
          tour={activeTour.definition}
          onClose={closeTour}
          returnFocusRef={returnFocusRef}
        />
      ) : null}
    </GuidanceContext.Provider>
  );
};

export default GuidanceProvider;
