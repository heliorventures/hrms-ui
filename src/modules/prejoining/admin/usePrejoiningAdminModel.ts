import { useCallback, useMemo, useRef } from 'react';

import { authorizationStateKey, createPermissionService } from '../../../auth/permissionService';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import { ALL_SCOPE } from './prejoiningAdminHelpers';
import { usePrejoiningAdminData } from './usePrejoiningAdminData';
import { usePrejoiningAdminState } from './usePrejoiningAdminState';
import { usePrejoiningConfigActions } from './usePrejoiningConfigActions';
import { usePrejoiningConversionActions } from './usePrejoiningConversionActions';
import { usePrejoiningDocumentActions } from './usePrejoiningDocumentActions';
import { usePrejoiningReviewActions } from './usePrejoiningReviewActions';

export function usePrejoiningAdminModel() {
  const client = useGraphClient('client');
  const { clientSession } = useAuth();
  const { currentTenant } = useTenant();
  const permissions = createPermissionService(clientSession);
  const canManage = permissions.canScopedPermission('prejoining:manage', ALL_SCOPE);
  const canReview = permissions.canScopedPermission('prejoining:review', ALL_SCOPE);
  const canConvert =
    canReview &&
    (permissions.canScopedPermission('employee:write', ALL_SCOPE) ||
      permissions.canScopedPermission('employee:manage', ALL_SCOPE)) &&
    permissions.canScopedPermission('role:manage', ALL_SCOPE);
  const ownerKey = `${currentTenant.id}|${authorizationStateKey(clientSession)}`;
  const ownerIdentityRef = useRef({ ownerKey, client, token: Symbol(ownerKey) });
  if (
    ownerIdentityRef.current.client !== client ||
    ownerIdentityRef.current.ownerKey !== ownerKey
  ) {
    ownerIdentityRef.current = { ownerKey, client, token: Symbol(ownerKey) };
  }
  const ownerToken = ownerIdentityRef.current.token;
  const ownerRef = useRef(ownerToken);
  ownerRef.current = ownerToken;
  const busyRef = useRef<string | null>(null);

  const state = usePrejoiningAdminState(canManage);
  const { setBusyAction, setError, setNotice } = state;
  const { applyCandidate, loadCandidates } = usePrejoiningAdminData({
    state,
    client,
    ownerRef,
    ownerToken,
    canManage,
    canReview,
  });
  const runAction = useCallback(
    async (key: string, operation: () => Promise<void>) => {
      if (busyRef.current) return;
      const requestOwner = ownerRef.current;
      busyRef.current = key;
      setBusyAction(key);
      setError(null);
      setNotice(null);
      try {
        await operation();
      } catch (cause) {
        if (ownerRef.current === requestOwner) setError(graphQlUserMessage(cause));
      } finally {
        if (ownerRef.current === requestOwner) setBusyAction(null);
        if (busyRef.current === key) busyRef.current = null;
      }
    },
    [setBusyAction, setError, setNotice]
  );

  const tabs = useMemo(
    () => [
      ...(canManage ? [{ id: 'config', label: 'Config', panelId: 'prejoining-config-panel' }] : []),
      ...(canReview
        ? [{ id: 'candidates', label: 'Candidates', panelId: 'prejoining-candidates-panel' }]
        : []),
    ],
    [canManage, canReview]
  );

  const context = { state, client, ownerRef, ownerToken, runAction, applyCandidate };
  return {
    ...state,
    canManage,
    canReview,
    canConvert,
    ownerToken,
    tabs,
    loadCandidates,
    ...usePrejoiningConfigActions(context),
    ...usePrejoiningReviewActions(context),
    ...usePrejoiningConversionActions(context),
    ...usePrejoiningDocumentActions(context),
  };
}
export type PrejoiningAdminModel = ReturnType<typeof usePrejoiningAdminModel>;
