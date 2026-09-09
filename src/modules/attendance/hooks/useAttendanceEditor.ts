import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { parseIsoDate, toIsoDate } from '../../../utils/calendarRange';
import type { FlatSegmentRow } from '../types';

function calendarDaysBetweenWorkAndToday(workIso: string): number {
  const a = parseIsoDate(workIso);
  a.setHours(0, 0, 0, 0);
  const b = new Date();
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function useAttendanceEditor(adjustPolicyDays: number, client: object, identity: string) {
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
    const delta = calendarDaysBetweenWorkAndToday(workIso);
    if (delta < 0) return false;
    return delta <= adjustPolicyDays;
  };
  return {
    adjustOpen: visible !== null,
    adjustDefaultDate: visible?.date ?? toIsoDate(new Date()),
    adjustDefaultSegment: visible?.segment ?? null,
    closeAdjust,
    isEditorCurrent,
    openAdjust,
    selfAdjustAllowedForDate,
  };
}
