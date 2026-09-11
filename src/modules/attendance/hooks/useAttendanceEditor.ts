import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { FlatSegmentRow } from '../types';

function dateOrdinal(iso: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const value = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(value) ? value / 86_400_000 : null;
}

export function useAttendanceEditor(
  adjustPolicyDays: number,
  client: object,
  identity: string,
  currentWorkDate: string | null,
  currentCalendarDate: string
) {
  const owner = useMemo(() => ({ client, identity }), [client, identity]);
  const currentOwner = useRef<typeof owner | null>(owner);
  const [selection, setSelection] = useState<{
    owner: typeof owner;
    date: string;
    segment: FlatSegmentRow | null;
  } | null>(null);
  useLayoutEffect(() => {
    currentOwner.current = owner;
    return () => {
      currentOwner.current = null;
    };
  }, [owner]);
  const isEditorCurrent = () => currentOwner.current === owner;
  const visible = selection?.owner === owner ? selection : null;
  const openAdjust = (iso: string, segment: FlatSegmentRow | null = null) => {
    if (isEditorCurrent()) setSelection({ owner, date: iso, segment });
  };
  const closeAdjust = () => {
    if (isEditorCurrent()) setSelection(null);
  };

  const selfAdjustAllowedForDate = (workIso: string) => {
    const work = dateOrdinal(workIso);
    const current = dateOrdinal(currentCalendarDate);
    if (work === null || current === null) return false;
    const delta = current - work;
    if (delta < 0) return false;
    return delta <= adjustPolicyDays;
  };
  return {
    adjustOpen: visible !== null,
    adjustDefaultDate: visible?.date ?? currentWorkDate ?? '',
    adjustDefaultSegment: visible?.segment ?? null,
    closeAdjust,
    isEditorCurrent,
    openAdjust,
    selfAdjustAllowedForDate,
  };
}
