import type { GraphQLClient } from 'graphql-request';
import { useCallback, useEffect, useRef, useState } from 'react';

import { authorizationStateKey } from '../../../auth/permissionService';
import { useAuth } from '../../../contexts/AuthContext';
import { uploadTenantFile, validateTenantUploadFile } from '../../../utils/tenantFileUpload';

interface UploadSession {
  owner: string;
  client: GraphQLClient;
  file: File | null;
  uploadedId: string | null;
  pending: Promise<string> | null;
}

/** One upload per selected file and owner, retained across request submission retries. */
export const useSubmissionFile = (client: GraphQLClient) => {
  const { tenantId, user, clientSession } = useAuth();
  const owner = `${tenantId ?? ''}:${user?.id ?? ''}:${authorizationStateKey(clientSession)}`;
  const ownerIdentity = useRef({ owner, client });
  if (ownerIdentity.current.owner !== owner || ownerIdentity.current.client !== client)
    ownerIdentity.current = { owner, client };
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const captureOwner = useCallback(() => {
    const captured = ownerIdentity.current;
    return () => mounted.current && ownerIdentity.current === captured;
  }, []);
  const [file, setVisibleFile] = useState<File | null>(null);
  const [inputRevision, setInputRevision] = useState(0);
  const session = useRef<UploadSession>({
    owner,
    client,
    file: null,
    uploadedId: null,
    pending: null,
  });
  if (session.current.owner !== owner || session.current.client !== client) {
    session.current = { owner, client, file: null, uploadedId: null, pending: null };
  }

  const reset = useCallback(() => {
    session.current = { ...session.current, file: null, uploadedId: null, pending: null };
    setVisibleFile(null);
    setInputRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    reset();
    return () => {
      session.current = { ...session.current, file: null, uploadedId: null, pending: null };
    };
  }, [client, owner, reset]);

  const setFile = useCallback((selected: File | null) => {
    session.current = { ...session.current, file: selected, uploadedId: null, pending: null };
    setVisibleFile(selected);
  }, []);

  const ensureUploaded = useCallback(async (): Promise<string> => {
    const current = session.current;
    if (!current.file) throw new Error('A supporting file is required.');
    const error = validateTenantUploadFile(current.file, 'Supporting file');
    if (error) throw new Error(error);
    if (current.uploadedId) return current.uploadedId;
    const isCurrent = () => session.current === current;
    current.pending ??= uploadTenantFile(current.client, current.file, isCurrent);
    try {
      const id = await current.pending;
      if (!isCurrent())
        throw new Error('Submission canceled because the form owner or file changed.');
      current.uploadedId = id;
      return id;
    } finally {
      current.pending = null;
    }
  }, []);

  return {
    file: session.current.file === file ? file : null,
    inputKey: `${owner}:${inputRevision}`,
    setFile,
    reset,
    ensureUploaded,
    ownerIdentity: ownerIdentity.current,
    captureOwner,
  };
};
