import { useCallback, useEffect, useRef, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';

import {
  ClientOpsClearanceBySeparationDocument,
  ClientOpsFnfBySeparationDocument,
  ClientOpsSeparationsListDocument,
  OnboardingChecklistDocument,
  type ClientOpsClearanceBySeparationQuery,
} from '../../api/graphql/graphql';
import type {
  ChecklistItem,
  ClearanceItemRow,
  FnfSettlementRow,
  SeparationRow,
} from './onboardingTypes';

type ResourcePhase = 'error' | 'loading' | 'ready' | 'refreshing';

interface OwnedListState<T> {
  data: T[];
  error: string | null;
  hasResolved: boolean;
  owner: GraphQLClient | null;
  phase: ResourcePhase;
  refreshError: string | null;
}

interface OffboardingData {
  clearance: ClearanceItemRow[];
  fnf: FnfSettlementRow | null;
}

interface OffboardingState extends Omit<OwnedListState<never>, 'data' | 'owner'> {
  data: OffboardingData;
  ownerClient: GraphQLClient | null;
  ownerSeparationId: string | null;
  version: number;
}

const emptyListState = <T,>(): OwnedListState<T> => ({
  data: [],
  error: null,
  hasResolved: false,
  owner: null,
  phase: 'loading',
  refreshError: null,
});

const EMPTY_OFFBOARDING_DATA: OffboardingData = { clearance: [], fnf: null };

const emptyOffboardingState = (): OffboardingState => ({
  data: EMPTY_OFFBOARDING_DATA,
  error: null,
  hasResolved: false,
  ownerClient: null,
  ownerSeparationId: null,
  phase: 'loading',
  refreshError: null,
  version: 0,
});

const beginListLoad = <T,>(
  current: OwnedListState<T>,
  owner: GraphQLClient
): OwnedListState<T> => {
  const ownsReadyData = current.owner === owner && current.hasResolved;
  return {
    data: ownsReadyData ? current.data : [],
    error: null,
    hasResolved: ownsReadyData,
    owner,
    phase: ownsReadyData ? 'refreshing' : 'loading',
    refreshError: null,
  };
};

const failListLoad = <T,>(
  current: OwnedListState<T>,
  owner: GraphQLClient,
  initialMessage: string,
  refreshMessage: string
): OwnedListState<T> => {
  if (current.owner === owner && current.hasResolved) {
    return { ...current, phase: 'ready', refreshError: refreshMessage };
  }
  return {
    data: [],
    error: initialMessage,
    hasResolved: false,
    owner,
    phase: 'error',
    refreshError: null,
  };
};

export function useOnboardingResources(
  client: GraphQLClient,
  activeTab: 'join' | 'exit',
  selectedSeparationId: string | null
) {
  const mountedRef = useRef(true);
  const clientRef = useRef(client);
  const selectedSeparationRef = useRef(selectedSeparationId);
  const checklistGeneration = useRef(0);
  const separationsGeneration = useRef(0);
  const offboardingGeneration = useRef(0);
  const [checklistState, setChecklistState] = useState<OwnedListState<ChecklistItem>>(
    emptyListState
  );
  const [separationsState, setSeparationsState] = useState<OwnedListState<SeparationRow>>(
    emptyListState
  );
  const [offboardingState, setOffboardingState] =
    useState<OffboardingState>(emptyOffboardingState);

  if (clientRef.current !== client) {
    clientRef.current = client;
    checklistGeneration.current += 1;
    separationsGeneration.current += 1;
    offboardingGeneration.current += 1;
  }
  if (selectedSeparationRef.current !== selectedSeparationId) {
    selectedSeparationRef.current = selectedSeparationId;
    offboardingGeneration.current += 1;
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      checklistGeneration.current += 1;
      separationsGeneration.current += 1;
      offboardingGeneration.current += 1;
    };
  }, []);

  const invalidateChecklist = useCallback(() => {
    checklistGeneration.current += 1;
  }, []);

  const invalidateSeparations = useCallback(() => {
    separationsGeneration.current += 1;
  }, []);

  const invalidateOffboarding = useCallback(() => {
    offboardingGeneration.current += 1;
  }, []);

  const refreshChecklist = useCallback(async () => {
    const owner = client;
    if (clientRef.current !== owner) return false;
    const generation = checklistGeneration.current + 1;
    checklistGeneration.current = generation;
    setChecklistState((current) => beginListLoad(current, owner));
    try {
      const response = await owner.request(OnboardingChecklistDocument, { limit: 100 });
      if (
        !mountedRef.current ||
        clientRef.current !== owner ||
        checklistGeneration.current !== generation
      ) {
        return false;
      }
      setChecklistState({
        data: response.onboardingChecklist,
        error: null,
        hasResolved: true,
        owner,
        phase: 'ready',
        refreshError: null,
      });
      return true;
    } catch {
      if (
        !mountedRef.current ||
        clientRef.current !== owner ||
        checklistGeneration.current !== generation
      ) {
        return false;
      }
      setChecklistState((current) =>
        failListLoad(
          current,
          owner,
          'We could not load your onboarding checklist. Try again when you are ready.',
          'We could not refresh your onboarding checklist. Your last loaded information is still shown.'
        )
      );
      return false;
    }
  }, [client]);

  const refreshSeparations = useCallback(async () => {
    const owner = client;
    if (clientRef.current !== owner) return false;
    const generation = separationsGeneration.current + 1;
    separationsGeneration.current = generation;
    setSeparationsState((current) => beginListLoad(current, owner));
    try {
      const response = await owner.request(ClientOpsSeparationsListDocument, { limit: 50 });
      if (
        !mountedRef.current ||
        clientRef.current !== owner ||
        separationsGeneration.current !== generation
      ) {
        return false;
      }
      setSeparationsState({
        data: response.separations,
        error: null,
        hasResolved: true,
        owner,
        phase: 'ready',
        refreshError: null,
      });
      return true;
    } catch {
      if (
        !mountedRef.current ||
        clientRef.current !== owner ||
        separationsGeneration.current !== generation
      ) {
        return false;
      }
      setSeparationsState((current) =>
        failListLoad(
          current,
          owner,
          'We could not load your exit requests. Try again when you are ready.',
          'We could not refresh your exit requests. Your last loaded information is still shown.'
        )
      );
      return false;
    }
  }, [client]);

  const refreshOffboarding = useCallback(
    async (separationId: string) => {
      const owner = client;
      if (
        clientRef.current !== owner ||
        selectedSeparationRef.current !== separationId
      ) {
        return false;
      }
      const generation = offboardingGeneration.current + 1;
      offboardingGeneration.current = generation;
      setOffboardingState((current) => {
        const ownsReadyData =
          current.ownerClient === owner &&
          current.ownerSeparationId === separationId &&
          current.hasResolved;
        return {
          data: ownsReadyData ? current.data : EMPTY_OFFBOARDING_DATA,
          error: null,
          hasResolved: ownsReadyData,
          ownerClient: owner,
          ownerSeparationId: separationId,
          phase: ownsReadyData ? 'refreshing' : 'loading',
          refreshError: null,
          version: current.version,
        };
      });
      try {
        const [fnfResponse, clearanceResponse] = await Promise.all([
          owner.request(ClientOpsFnfBySeparationDocument, { separationId }),
          owner.request<ClientOpsClearanceBySeparationQuery>(
            ClientOpsClearanceBySeparationDocument,
            { separationId }
          ),
        ]);
        if (
          !mountedRef.current ||
          clientRef.current !== owner ||
          selectedSeparationRef.current !== separationId ||
          offboardingGeneration.current !== generation
        ) {
          return false;
        }
        setOffboardingState((current) => ({
          data: {
            clearance: clearanceResponse.clearanceChecklist,
            fnf: fnfResponse.fnfSettlement ?? null,
          },
          error: null,
          hasResolved: true,
          ownerClient: owner,
          ownerSeparationId: separationId,
          phase: 'ready',
          refreshError: null,
          version: current.version + 1,
        }));
        return true;
      } catch {
        if (
          !mountedRef.current ||
          clientRef.current !== owner ||
          selectedSeparationRef.current !== separationId ||
          offboardingGeneration.current !== generation
        ) {
          return false;
        }
        setOffboardingState((current) => {
          const ownsReadyData =
            current.ownerClient === owner &&
            current.ownerSeparationId === separationId &&
            current.hasResolved;
          if (ownsReadyData) {
            return {
              ...current,
              phase: 'ready',
              refreshError:
                'We could not refresh the clearance and final settlement details. Your last loaded information is still shown.',
            };
          }
          return {
            data: EMPTY_OFFBOARDING_DATA,
            error:
              'We could not load the clearance and final settlement details. Try again when you are ready.',
            hasResolved: false,
            ownerClient: owner,
            ownerSeparationId: separationId,
            phase: 'error',
            refreshError: null,
            version: current.version,
          };
        });
        return false;
      }
    },
    [client]
  );

  useEffect(() => {
    void refreshChecklist();
    return invalidateChecklist;
  }, [invalidateChecklist, refreshChecklist]);

  useEffect(() => {
    if (activeTab !== 'exit') {
      invalidateSeparations();
      return;
    }
    void refreshSeparations();
    return invalidateSeparations;
  }, [activeTab, invalidateSeparations, refreshSeparations]);

  useEffect(() => {
    if (!selectedSeparationId) {
      invalidateOffboarding();
      return;
    }
    void refreshOffboarding(selectedSeparationId);
    return invalidateOffboarding;
  }, [invalidateOffboarding, refreshOffboarding, selectedSeparationId]);

  const checklist =
    checklistState.owner === client ? checklistState : emptyListState<ChecklistItem>();
  const separations =
    separationsState.owner === client ? separationsState : emptyListState<SeparationRow>();
  const offboarding =
    selectedSeparationId &&
    offboardingState.ownerClient === client &&
    offboardingState.ownerSeparationId === selectedSeparationId
      ? offboardingState
      : { ...emptyOffboardingState(), phase: selectedSeparationId ? 'loading' : 'ready' as const };

  return {
    checklist,
    offboarding,
    refreshChecklist,
    refreshOffboarding,
    refreshSeparations,
    separations,
  };
}
