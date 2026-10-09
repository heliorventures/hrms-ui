import type { GraphQLClient } from 'graphql-request';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { readEmployeeUan, saveEmployeeUan } from '../../../../api/employeeUan';
import { useFeedbackState } from '../../../../hooks/useFeedbackState';
import { useRetainedQuery } from '../../../../hooks/useRetainedQuery';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';

export const useEmployeeUan = (
  client: GraphQLClient,
  employeeId: string,
  canEdit: boolean,
  onChanged?: () => void,
  refreshVersion = 0
) => {
  const load = useCallback(() => {
    void refreshVersion;
    return readEmployeeUan(client, employeeId);
  }, [client, employeeId, refreshVersion]);
  const loadOwner = useRef(load);
  loadOwner.current = load;
  const query = useRetainedQuery(load);
  const [saved, setSaved] = useState<{ owner: typeof load; number: string | null } | null>(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  const [success, setSuccess] = useState(false);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const number = saved?.owner === load ? saved.number : (query.data?.employeeUanNumber ?? null);
  const normalizedDraft = draft.trim();
  const valid = normalizedDraft === '' || /^[0-9]{12}$/.test(normalizedDraft);
  const ready = query.phase === 'ready';

  useLayoutEffect(() => {
    generation.current += 1;
    inFlight.current = false;
    setSaved(null);
    setDraft('');
    setEditing(false);
    setSaving(false);
    setError(null);
    setSuccess(false);
    return () => {
      generation.current += 1;
    };
  }, [client, employeeId, canEdit, setError]);

  const startEditing = () => {
    setDraft(number ?? '');
    setEditing(true);
    setError(null);
    setSuccess(false);
  };

  const cancelEditing = () => {
    setDraft('');
    setEditing(false);
    setError(null);
  };

  const save = async () => {
    if (!canEdit || !ready || !editing || !valid || inFlight.current) return;
    const owner = generation.current;
    inFlight.current = true;
    setSaving(true);
    setError(null);
    try {
      const result = await saveEmployeeUan(client, employeeId, normalizedDraft);
      if (generation.current !== owner) return;
      setSaved({ owner: loadOwner.current, number: result.setEmployeeUanNumber ?? null });
      setEditing(false);
      setDraft('');
      setSuccess(true);
      onChanged?.();
    } catch (cause) {
      if (generation.current === owner) setError(graphQlUserMessage(cause));
    } finally {
      if (generation.current === owner) {
        inFlight.current = false;
        setSaving(false);
      }
    }
  };

  return {
    number,
    draft,
    setDraft,
    editing,
    saving,
    error,
    success,
    valid,
    ready,
    canSave: canEdit && ready && valid && normalizedDraft !== (number ?? '') && !saving,
    query,
    startEditing,
    cancelEditing,
    save,
  };
};
