import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { authorizationStateKey } from '../../../auth/permissionService';
import { useAuth } from '../../../contexts/AuthContext';
import { useGraphClient } from '../../../hooks/useGraphClient';

export interface ApplyLeaveDialogContext<Client> {
  client: Client;
  isOpen: boolean;
}

export function useApplyLeaveDialogOwnership<Client>(client: Client, isOpen: boolean) {
  const dialogContext = useMemo<ApplyLeaveDialogContext<Client>>(
    () => ({ client, isOpen }),
    [client, isOpen]
  );
  const dialogContextRef = useRef(dialogContext);
  const activeSubmissionRef = useRef<ApplyLeaveDialogContext<Client> | null>(null);

  useLayoutEffect(() => {
    dialogContextRef.current = dialogContext;
    return () => {
      dialogContextRef.current = { ...dialogContext, isOpen: false };
    };
  }, [dialogContext]);

  return { activeSubmissionRef, dialogContext, dialogContextRef };
}

// Replacing the keyed child discards every draft field, native file input and async reference.
export function useApplyLeaveOwner() {
  const client = useGraphClient('client');
  const { tenantId, user, clientSession } = useAuth();
  const identity = JSON.stringify([tenantId, user?.id, authorizationStateKey(clientSession)]);
  const [owner, setOwner] = useState({ client, identity, revision: 0 });
  if (owner.client !== client || owner.identity !== identity) {
    const next = { client, identity, revision: owner.revision + 1 };
    setOwner(next);
    return next;
  }
  return owner;
}
