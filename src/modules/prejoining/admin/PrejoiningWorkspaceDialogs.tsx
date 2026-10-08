import { ConfirmJoinedModal } from './ConfirmJoinedModal';
import { CandidateDrawer } from './PrejoiningAdminDialogs';
import type { PrejoiningAdminModel } from './usePrejoiningAdminModel';

export const PrejoiningWorkspaceDialogs = ({ model }: { model: PrejoiningAdminModel }) => {
  const {
    selected,
    setSelected,
    busyAction,
    setError,
    setNotice,
    invitation,
    correctionOpen,
    setCorrectionOpen,
    feedback,
    setFeedback,
    confirmOpen,
    setConfirmOpen,
    confirmDraft,
    setConfirmDraft,
    confirmError,
    departments,
    designations,
    managers,
    managerSearch,
    setManagerSearch,
    managerOffset,
    hasMoreManagers,
    roles,
    reviewAction,
    reissue,
    loadConversionOptions,
    openConfirm,
    confirmJoined,
    downloadDocument,
    canManage,
    canConvert,
  } = model;

  return (
    <>
      <CandidateDrawer
        candidate={selected}
        canManage={canManage}
        canConvert={canConvert}
        busyAction={busyAction}
        correctionOpen={correctionOpen}
        feedback={feedback}
        invitation={invitation?.candidate.id === selected?.id ? invitation : null}
        onClose={() => {
          if (!busyAction) setSelected(null);
        }}
        onFeedback={setFeedback}
        onOpenCorrections={() => setCorrectionOpen(true)}
        onCancelCorrections={() => setCorrectionOpen(false)}
        onReview={reviewAction}
        onReissue={reissue}
        onConfirm={openConfirm}
        onDownload={downloadDocument}
        onCopy={(url) =>
          void navigator.clipboard
            .writeText(url)
            .then(() => setNotice('Private invitation link copied.'))
            .catch(() => setError('The link could not be copied. Select and copy it manually.'))
        }
      />
      <ConfirmJoinedModal
        open={confirmOpen}
        candidate={selected}
        draft={confirmDraft}
        error={confirmError}
        busy={busyAction === 'confirm' || busyAction === 'directory'}
        departments={departments}
        designations={designations}
        managers={managers}
        roles={roles}
        managerSearch={managerSearch}
        hasMoreManagers={hasMoreManagers}
        onManagerSearch={setManagerSearch}
        onSearchManagers={() => void loadConversionOptions(managerSearch, 0, false)}
        onLoadMoreManagers={() =>
          void loadConversionOptions(managerSearch, managerOffset + 50, true)
        }
        onChange={setConfirmDraft}
        onClose={() => {
          if (!busyAction) setConfirmOpen(false);
        }}
        onConfirm={confirmJoined}
      />
    </>
  );
};
