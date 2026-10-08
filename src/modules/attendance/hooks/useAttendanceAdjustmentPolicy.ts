import { useCallback, useEffect, useState } from 'react';

import { AttendanceAdjustmentPolicyDocument } from '../../../api/graphql/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';

export function useAttendanceAdjustmentPolicy(client: ReturnType<typeof useGraphClient>) {
  const [adjustPolicyDays, setAdjustPolicyDays] = useState(14);
  const [policyStatus, setPolicyStatus] = useState<'loading' | 'ready'>('loading');
  const loadPolicy = useCallback(async () => {
    try {
      const r = await client.request(AttendanceAdjustmentPolicyDocument);
      const raw = r.attendanceAdjustmentPolicy.maxSelfAdjustDays;
      const n = raw;
      return Number.isFinite(n) ? n : 14;
    } catch {
      return 14;
    }
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    setPolicyStatus('loading');
    void loadPolicy().then((days) => {
      if (!cancelled) {
        setAdjustPolicyDays(days);
        setPolicyStatus('ready');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadPolicy]);

  return { adjustPolicyDays, policyReady: policyStatus === 'ready' };
}
