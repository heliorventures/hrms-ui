import type { PrejoiningActionContext } from './prejoiningActionContext';
import {
  PrejoiningApproveAdminDocument,
  PrejoiningCandidateAdminDocument,
  PrejoiningCancelAdminDocument,
  PrejoiningReissueAdminDocument,
  PrejoiningRequestChangesAdminDocument,
} from './prejoiningAdminDocuments';
import { emptyConfirm } from './prejoiningAdminHelpers';
import type { PrejoiningCandidate, PrejoiningInvitation } from './prejoiningAdminTypes';

export function usePrejoiningReviewActions(context: PrejoiningActionContext) {
  const { client, ownerRef, ownerToken, runAction, applyCandidate } = context;
  const {
    selected,
    setSelected,
    setNotice,
    setInvitation,
    setCorrectionOpen,
    feedback,
    setFeedback,
    setConfirmOpen,
    setConfirmDraft,
    setConfirmError,
    setDepartments,
    setDesignations,
    setManagers,
    setManagerSearch,
    setManagerOffset,
    setHasMoreManagers,
    setRoles,
  } = context.state;
  const openCandidate = (id: string) =>
    void runAction(`open-${id}`, async () => {
      const result = await client.request<{ prejoiningCandidate: PrejoiningCandidate | null }>(
        PrejoiningCandidateAdminDocument,
        { id }
      );
      if (ownerRef.current !== ownerToken) return;
      if (!result.prejoiningCandidate) throw new Error('Candidate record is no longer available.');
      setSelected(result.prejoiningCandidate);
      setFeedback(result.prejoiningCandidate.feedback ?? '');
      setCorrectionOpen(false);
      setConfirmOpen(false);
      setConfirmDraft(emptyConfirm());
      setConfirmError(null);
      setDepartments([]);
      setDesignations([]);
      setManagers([]);
      setRoles([]);
      setManagerSearch('');
      setManagerOffset(0);
      setHasMoreManagers(false);
    });

  const reviewAction = (kind: 'approve' | 'changes' | 'cancel') => {
    if (!selected) return;
    void runAction(kind, async () => {
      let next: PrejoiningCandidate;
      if (kind === 'approve') {
        const result = await client.request<{ approvePrejoining: PrejoiningCandidate }>(
          PrejoiningApproveAdminDocument,
          { id: selected.id, revision: selected.revision }
        );
        if (ownerRef.current !== ownerToken) return;
        next = result.approvePrejoining;
        setNotice('Candidate information approved. No employee or login has been created yet.');
      } else if (kind === 'changes') {
        if (!feedback.trim()) throw new Error('Correction instructions are required.');
        const result = await client.request<{ requestPrejoiningChanges: PrejoiningCandidate }>(
          PrejoiningRequestChangesAdminDocument,
          { id: selected.id, revision: selected.revision, feedback: feedback.trim() }
        );
        if (ownerRef.current !== ownerToken) return;
        next = result.requestPrejoiningChanges;
        setCorrectionOpen(false);
        setNotice(
          'Corrections requested. Reissue the invitation when ready to share a replacement link.'
        );
      } else {
        const result = await client.request<{ cancelPrejoining: PrejoiningCandidate }>(
          PrejoiningCancelAdminDocument,
          { id: selected.id, revision: selected.revision }
        );
        if (ownerRef.current !== ownerToken) return;
        next = result.cancelPrejoining;
        setNotice('Candidate invitation cancelled.');
      }
      if (ownerRef.current === ownerToken) applyCandidate(next);
    });
  };

  const reissue = (sendEmail: boolean) => {
    if (!selected) return;
    void runAction('reissue', async () => {
      const result = await client.request<{ reissuePrejoining: PrejoiningInvitation }>(
        PrejoiningReissueAdminDocument,
        { id: selected.id, revision: selected.revision, sendEmail }
      );
      if (ownerRef.current !== ownerToken) return;
      setInvitation(result.reissuePrejoining);
      applyCandidate(result.reissuePrejoining.candidate);
      setNotice(
        result.reissuePrejoining.emailStatus === 'SENT'
          ? 'Replacement invitation email sent.'
          : 'Replacement invitation link created.'
      );
    });
  };

  return { openCandidate, reviewAction, reissue };
}
