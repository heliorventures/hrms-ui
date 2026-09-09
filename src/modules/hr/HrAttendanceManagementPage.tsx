import { useCallback, useContext, useLayoutEffect } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

import { authorizationStateKey } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useRememberedRouteView } from '../../hooks/useRememberedRouteView';

import {
  currentMonthFilters,
  type ManagedAttendanceActions,
  type ManagedAttendanceFiltersValue,
} from './attendance/managedAttendanceTypes';
import HrAttendanceManagementView from './attendance/ManagedAttendanceView';

export type HrAttendanceManagementPageProps = Partial<ManagedAttendanceActions>;

// Employee search stays out of URLs and persistent browser storage.
const rememberedEmployeeFilters = new WeakMap<
  object,
  {
    identity: string;
    employeeSearch: string;
    employeeId?: string;
  }
>();

const HrAttendanceManagementPage = (props: HrAttendanceManagementPageProps) => {
  const client = useGraphClient('client');
  const { clientSession, user, tenantId } = useAuth();
  const identity = `${tenantId ?? ''}:${user?.id ?? ''}:${authorizationStateKey(clientSession)}`;
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const defaults = currentMonthFilters();
  const [view, updateView] = useRememberedRouteView(
    client,
    identity,
    'hr-attendance',
    {
      fromDate: defaults.fromDate,
      toDate: defaults.toDate,
    },
    (params) => ({
      fromDate: params.get('fromDate') ?? defaults.fromDate,
      toDate: params.get('toDate') ?? defaults.toDate,
    })
  );
  const remembered = rememberedEmployeeFilters.get(navigator);
  const employeeFilters: Pick<ManagedAttendanceFiltersValue, 'employeeSearch' | 'employeeId'> =
    remembered?.identity === identity ? remembered : { employeeSearch: '' };

  useLayoutEffect(() => {
    if (rememberedEmployeeFilters.get(navigator)?.identity !== identity) {
      rememberedEmployeeFilters.set(navigator, { identity, employeeSearch: '' });
    }
  }, [navigator, identity]);

  const rememberFilters = useCallback(
    (filters: ManagedAttendanceFiltersValue) => {
      rememberedEmployeeFilters.set(navigator, {
        identity,
        employeeSearch: filters.employeeSearch,
        employeeId: filters.employeeId,
      });
      if (filters.fromDate !== view.fromDate || filters.toDate !== view.toDate) {
        updateView({ fromDate: filters.fromDate, toDate: filters.toDate });
      }
    },
    [navigator, identity, updateView, view.fromDate, view.toDate]
  );

  return (
    <HrAttendanceManagementView
      {...props}
      key={JSON.stringify([identity, view.fromDate, view.toDate])}
      initialFilters={{
        ...view,
        employeeSearch: employeeFilters.employeeSearch,
        employeeId: employeeFilters.employeeId,
      }}
      onFiltersChange={rememberFilters}
    />
  );
};

export default HrAttendanceManagementPage;
