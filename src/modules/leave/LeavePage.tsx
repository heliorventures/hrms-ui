import { useMemo, useState } from 'react';

import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { boundedInteger, useRememberedRouteView } from '../../hooks/useRememberedRouteView';

import PersonalLeaveContent from './components/PersonalLeaveContent';

const LeavePage = () => {
  const { clientSession, user, tenantId } = useAuth();
  const permissions = createPermissionService(clientSession);
  const client = useGraphClient('client');
  const [owner, setOwner] = useState({ client, generation: 0 });
  if (owner.client !== client) setOwner({ client, generation: owner.generation + 1 });
  const identity = `${tenantId ?? ''}:${user?.id ?? ''}:${authorizationStateKey(clientSession)}`;
  const defaultYear = useMemo(() => new Date().getFullYear(), []);
  const [view, updateView] = useRememberedRouteView(
    client,
    identity,
    'leave',
    { year: String(defaultYear), page: '0' },
    (params) => ({
      year: String(
        boundedInteger(params.get('year'), defaultYear, defaultYear - 2, defaultYear + 1)
      ),
      page: String(boundedInteger(params.get('page'), 0, 0, 100000)),
    })
  );
  const balanceYear = Number(view.year);
  const requestPage = Number(view.page);
  const yearChoices = useMemo(() => {
    const years: number[] = [];
    for (let year = defaultYear - 2; year <= defaultYear + 1; year += 1) years.push(year);
    return years;
  }, [defaultYear]);

  if (!permissions.canCapability('route.leave')) return null;
  return (
    <PersonalLeaveContent
      key={`${identity}:${owner.generation}:${balanceYear}:${requestPage}`}
      client={client}
      balanceYear={balanceYear}
      requestPage={requestPage}
      yearChoices={yearChoices}
      updateView={updateView}
      canSubmitLeave={permissions.canCapability('action.leave.submit')}
      canApproveLeave={permissions.canCapability('action.leave.approve')}
      canManageLeave={permissions.canCapability('action.leave.manage')}
    />
  );
};
export default LeavePage;
