import { authorizationStateKey } from '../../../auth/permissionService';
import type { useAuth } from '../../../contexts/AuthContext';
import type { useGraphClient } from '../../../hooks/useGraphClient';
import { boundedInteger, useRememberedRouteView } from '../../../hooks/useRememberedRouteView';

export function useAttendancePeriod(
  client: ReturnType<typeof useGraphClient>,
  auth: Pick<ReturnType<typeof useAuth>, 'clientSession' | 'user' | 'tenantId'>,
  now: Date
) {
  const { clientSession, user, tenantId } = auth;
  const [view, updateView] = useRememberedRouteView(
    client,
    `${tenantId ?? ''}:${user?.id ?? ''}:${authorizationStateKey(clientSession)}`,
    'attendance',
    { year: String(now.getFullYear()), month: String(now.getMonth() + 1) },
    (params) => ({
      year: String(
        boundedInteger(
          params.get('year'),
          now.getFullYear(),
          now.getFullYear() - 3,
          now.getFullYear() + 3
        )
      ),
      month: String(boundedInteger(params.get('month'), now.getMonth() + 1, 1, 12)),
    })
  );
  const year = Number(view.year);
  const monthIndex = Number(view.month) - 1;
  return { year, monthIndex, updateView };
}
