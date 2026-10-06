import { useEffect, useRef, type MutableRefObject } from 'react';

import type { OverviewReadState } from './overviewPreferenceTypes';
import { useGuidance } from './useGuidance';

const AutomaticOverviewController = ({
  identityKey,
  currentState,
  automaticOverviewKeysRef,
}: {
  identityKey: string | null;
  currentState: OverviewReadState | undefined;
  automaticOverviewKeysRef: MutableRefObject<Set<string>>;
}) => {
  const { activeTour, isTourActive, startOverview } = useGuidance();
  const previousIdentityRef = useRef(identityKey);
  useEffect(() => {
    if (previousIdentityRef.current !== identityKey) {
      previousIdentityRef.current = identityKey;
      return;
    }
    if (!identityKey) return;
    if (activeTour?.kind === 'overview') {
      automaticOverviewKeysRef.current.add(identityKey);
      return;
    }
    if (isTourActive) return;
    if (
      currentState?.status !== 'ready' ||
      currentState.dismissedAt !== null ||
      automaticOverviewKeysRef.current.has(identityKey)
    ) {
      return;
    }

    if (startOverview({ persistDismissalOnClose: true })) {
      automaticOverviewKeysRef.current.add(identityKey);
    }
  }, [
    activeTour?.kind,
    automaticOverviewKeysRef,
    currentState,
    identityKey,
    isTourActive,
    startOverview,
  ]);
  return null;
};

export default AutomaticOverviewController;
