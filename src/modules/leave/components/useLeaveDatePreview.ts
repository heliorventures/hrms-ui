import { useCallback, useEffect, useState } from 'react';

import source from '../../../api/documents/leaveDatePreview.graphql?raw';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import type { useApplyLeaveFields } from './useApplyLeaveFields';
import type { ApplyLeaveOwnership } from './useApplyLeaveForm';

export const useLeaveDatePreview = (
  ownership: ApplyLeaveOwnership,
  fields: ReturnType<typeof useApplyLeaveFields>,
  halfDayEligible: boolean
) => {
  const context = ownership.dialogContext;
  const variables = {
    leaveTypeId: fields.leaveTypeId,
    fromDate: fields.fromDate,
    toDate: fields.toDate,
    isHalfDay: halfDayEligible && fields.isHalfDay,
  };
  const key = JSON.stringify(variables);
  const ready =
    context.isOpen &&
    !!variables.leaveTypeId &&
    !!variables.fromDate &&
    !!variables.toDate &&
    variables.fromDate <= variables.toDate;
  const [state, setState] = useState<{
    key: string;
    context: typeof context;
    days?: number;
    error?: string;
  }>();
  const [revision, setRevision] = useState(0);
  const retryPreview = useCallback(() => {
    setState(undefined);
    setRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void context.client
        .request<{ leaveDatePreview: { requestedDays: string } }>(source, JSON.parse(key))
        .then((result) => {
          const days = Number(result.leaveDatePreview.requestedDays);
          if (!Number.isFinite(days) || days <= 0)
            throw new Error('Unable to calculate the chargeable leave dates.');
          if (!cancelled && ownership.dialogContextRef.current === context)
            setState({ key, context, days });
        })
        .catch((error) => {
          if (!cancelled && ownership.dialogContextRef.current === context)
            setState({ key, context, error: graphQlUserMessage(error) });
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [context, key, ready, ownership.dialogContextRef, revision]);
  const current = state?.context === context && state.key === key ? state : undefined;
  return {
    requestedDays: current?.days,
    previewError: current?.error,
    previewLoading: ready && !current,
    retryPreview,
  };
};
