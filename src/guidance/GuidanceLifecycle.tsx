import type { PropsWithChildren } from 'react';

import AutomaticOverviewController from './AutomaticOverviewController';
import GuidanceProvider from './GuidanceProvider';
import OverviewPreferenceNotice from './OverviewPreferenceNotice';
import type { TourContext, TourDefinition, TourStep } from './tourTypes';
import { useOverviewPreference } from './useOverviewPreference';

type Props = PropsWithChildren<{
  identityKey: string | null;
  matchedRoutePath: string | null;
  authorizationKey: string;
  tourContext: Omit<TourContext, 'routePath'>;
  overviewTour: TourDefinition;
  navigateStep?: (step: TourStep, confirmed?: boolean) => boolean;
}>;

const GuidanceLifecycle = ({ identityKey, children, ...providerProps }: Props) => {
  const preference = useOverviewPreference(identityKey);
  return (
    <GuidanceProvider
      {...providerProps}
      identityKey={identityKey}
      onOverviewDismiss={preference.persistDismissal}
    >
      <AutomaticOverviewController
        identityKey={identityKey}
        currentState={preference.currentState}
        automaticOverviewKeysRef={preference.automaticOverviewKeysRef}
      />
      {children}
      {preference.activeError ? (
        <OverviewPreferenceNotice
          activeError={preference.activeError}
          dismissalSaving={preference.dismissalSaving}
          onRetry={preference.retryPreference}
          onDismiss={preference.clearPreferenceError}
        />
      ) : null}
    </GuidanceProvider>
  );
};

export default GuidanceLifecycle;
