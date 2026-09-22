import { useState, type Dispatch, type SetStateAction } from 'react';

import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import {
  ArchivePerformanceProgramDocument,
  SavePerformanceProgramPolicyDocument,
  type PerformanceProgramPolicyRow,
} from '../performanceAdminQueries';

import { invalidDeadlines, toDraft, type PolicyDraft } from './performanceProgramPolicy';

interface Props {
  archiveReason: string;
  draft: PolicyDraft;
  onArchived: () => Promise<void>;
  performanceProgramId: string;
  setDraft: Dispatch<SetStateAction<PolicyDraft>>;
  setMessage: Dispatch<SetStateAction<string | null>>;
}

export const usePerformanceProgramPolicyActions = ({
  archiveReason,
  draft,
  onArchived,
  performanceProgramId,
  setDraft,
  setMessage,
}: Props) => {
  const client = useGraphClient('client');
  const [busy, setBusy] = useState(false);

  const savePolicy = async () => {
    const issue = invalidDeadlines(draft);
    if (issue) {
      setMessage(issue);
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await client.request<{
        savePerformanceProgramPolicy: PerformanceProgramPolicyRow;
      }>(SavePerformanceProgramPolicyDocument, { input: { performanceProgramId, ...draft } });
      setDraft(toDraft(result.savePerformanceProgramPolicy));
      setMessage('Program policy saved. It applies to future launches.');
    } catch (cause) {
      setMessage(graphQlUserMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const archiveProgram = async () => {
    if (!archiveReason.trim()) throw new Error('An archive reason is required.');
    setBusy(true);
    setMessage(null);
    try {
      await client.request(ArchivePerformanceProgramDocument, {
        performanceProgramId,
        reason: archiveReason.trim(),
      });
      await onArchived();
      setMessage('Program archived. Existing cycles and history remain available.');
    } catch (cause) {
      setMessage(graphQlUserMessage(cause));
      throw cause;
    } finally {
      setBusy(false);
    }
  };

  return { archiveProgram, busy, savePolicy };
};
