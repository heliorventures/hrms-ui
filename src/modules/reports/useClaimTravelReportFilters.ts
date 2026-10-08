import { useState } from 'react';

import type { ClaimTravelFilter, HrReportKind } from './reportDocuments';

const EMPTY: ClaimTravelFilter = Object.freeze({});
export const isClaimTravelReport = (kind: string) =>
  kind === 'EXPENSE_CLAIMS' || kind === 'TRAVEL_REQUESTS';

export const useClaimTravelReportFilters = (kind: HrReportKind) => {
  const [state, setState] = useState({ kind, draft: EMPTY, applied: EMPTY });
  const current = state.kind === kind ? state : { kind, draft: EMPTY, applied: EMPTY };
  const updateDraft = (values: Partial<ClaimTravelFilter>) => {
    setState((prior) => ({
      kind,
      draft: { ...(prior.kind === kind ? prior.draft : EMPTY), ...values },
      applied: prior.kind === kind ? prior.applied : EMPTY,
    }));
  };
  const apply = () => {
    const draft: ClaimTravelFilter = { ...current.draft };
    for (const key of [
      'departmentId',
      'locationId',
      'expenseCategoryId',
      'approvalStatus',
      'paymentStatus',
      'routeSearch',
    ] as const) {
      if (key in draft) draft[key] = draft[key]?.trim() || null;
    }
    setState({ kind, draft, applied: Object.freeze({ ...draft }) });
  };
  const clear = () => setState({ kind, draft: EMPTY, applied: EMPTY });
  return { draft: current.draft, applied: current.applied, updateDraft, apply, clear };
};

export type ClaimTravelFilterState = ReturnType<typeof useClaimTravelReportFilters>;
