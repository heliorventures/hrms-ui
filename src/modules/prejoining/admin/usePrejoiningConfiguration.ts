import { useEffect } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import type { PrejoiningActionContext } from './prejoiningActionContext';
import { PrejoiningAdminBootstrapDocument } from './prejoiningAdminDocuments';
import { normalizeConfig } from './prejoiningAdminHelpers';
import type { PrejoiningField } from './prejoiningAdminTypes';

export function usePrejoiningConfiguration(
  context: Omit<PrejoiningActionContext, 'runAction' | 'applyCandidate'> & { canManage: boolean }
) {
  const { client, ownerRef, ownerToken, canManage } = context;
  const { setConfig, setCatalog, setDocumentTypes, setConfigLoading, setError, setNotice } =
    context.state;
  useEffect(() => {
    const requestOwner = ownerToken;
    ownerRef.current = requestOwner;
    let active = true;
    const owns = () => active && ownerRef.current === requestOwner;
    setConfigLoading(canManage);
    setError(null);
    setNotice(null);
    const tasks: Promise<void>[] = [];
    if (canManage) {
      tasks.push(
        client
          .request<{
            prejoiningConfig: unknown;
            prejoiningFieldCatalog: PrejoiningField[];
            prejoiningDocumentTypes: Array<{ id: string; name: string }>;
          }>(PrejoiningAdminBootstrapDocument)
          .then((result) => {
            if (!owns()) return;
            setConfig(normalizeConfig(result.prejoiningConfig));
            setCatalog(result.prejoiningFieldCatalog);
            setDocumentTypes(
              result.prejoiningDocumentTypes.map((row) => ({ id: row.id, label: row.name }))
            );
          })
      );
    }
    Promise.all(tasks)
      .catch((cause) => {
        if (owns()) setError(graphQlUserMessage(cause));
      })
      .finally(() => {
        if (owns()) setConfigLoading(false);
      });
    return () => {
      active = false;
      if (ownerRef.current === requestOwner) ownerRef.current = Symbol('disposed');
    };
  }, [
    canManage,
    client,
    ownerToken,
    ownerRef,
    setCatalog,
    setConfig,
    setDocumentTypes,
    setError,
    setConfigLoading,
    setNotice,
  ]);
}
