import { useEffect, useState } from 'react';

import { RoleIdsForUserDocument, SetUserRolesDocument } from '../../api/graphql/graphql';
import type { RbacAccessBoardQuery } from '../../api/rbac/graphql';
import { useDialogs } from '../../contexts/DialogContext';
import type { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

export function useRbacUserRoles(
  client: ReturnType<typeof useGraphClient>,
  board: RbacAccessBoardQuery | null,
  setError: (message: string | null) => void,
  setInfo: (message: string | null) => void
) {
  const { confirm } = useDialogs();
  const [selectedUserId, selectUser] = useState<string | null>(null);
  const [roleIds, setRoleIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  useEffect(() => {
    setLoadedUserId(null);
    setRoleIds(new Set());
    if (!selectedUserId) return;
    let cancelled = false;
    setLoading(true);
    void client
      .request(RoleIdsForUserDocument, { userId: selectedUserId })
      .then((data) => {
        if (cancelled) return;
        setRoleIds(new Set(data.roleIdsForUser));
        setLoadedUserId(selectedUserId);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(graphQlUserMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client, selectedUserId, setError]);
  const toggle = (id: string) =>
    setRoleIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const save = async () => {
    if (!selectedUserId || loadedUserId !== selectedUserId) return;
    const user = board?.tenantDirectoryUsers.find((row) => row.id === selectedUserId);
    const confirmed = await confirm({
      title: 'Update assigned roles',
      message: `This replaces the role list for ${user?.username ?? selectedUserId}. Assigned users must sign in again.`,
      confirmLabel: `Save ${roleIds.size} role(s)`,
    });
    if (!confirmed) return;
    setInfo(null);
    setError(null);
    try {
      await client.request(SetUserRolesDocument, {
        userId: selectedUserId,
        roleIds: Array.from(roleIds),
      });
      setInfo('Roles saved. Assigned users must sign in again.');
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };
  return {
    selectedUserId,
    selectUser,
    roleIds,
    loading: loading || loadedUserId !== selectedUserId,
    toggle,
    save,
  };
}
