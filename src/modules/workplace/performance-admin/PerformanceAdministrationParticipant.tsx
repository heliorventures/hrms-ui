import { useState } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

import type {
  PerformanceAdminParticipant,
  PerformanceFeedbackRow,
  PerformanceRevisionDetailRow,
  PerformanceRevisionRow,
} from '../performanceAdminQueries';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

const RevisionReadout = ({ detail }: { detail: PerformanceRevisionDetailRow | null }) => {
  if (!detail)
    return (
      <p className="text-sm text-content-secondary">
        Select a revision to read its immutable snapshot.
      </p>
    );
  return (
    <div className="mt-4 space-y-3 rounded-md border border-line p-3 text-sm">
      <h3 className="font-semibold">Revision {detail.review.revision} readout</h3>
      {detail.answers.map((answer) => (
        <p key={answer.questionId} className="rounded bg-surface-selected p-2">
          Question {answer.questionId}: employee {answer.employeeTextAnswer ?? '—'} · manager{' '}
          {answer.managerTextAnswer ?? '—'}
        </p>
      ))}
      {detail.kpis.map((kpi) => (
        <p key={kpi.id} className="rounded bg-surface-selected p-2">
          KPI {kpi.metricName}: target {kpi.targetValue ?? '—'} {kpi.unit ?? ''} · actual{' '}
          {kpi.actualValue ?? '—'}
        </p>
      ))}
      {detail.calibrations.map((decision) => (
        <p key={decision.id} className="rounded bg-surface-selected p-2">
          Calibration {decision.finalRating}
          {decision.performanceBand ? ` · ${decision.performanceBand}` : ''}: {decision.reason}
        </p>
      ))}
      {detail.acknowledgementComment && <p>Acknowledgement: {detail.acknowledgementComment}</p>}
    </div>
  );
};

const RevisionSelector = ({
  participant,
  selectedRevision,
  onChoose,
}: {
  participant: PerformanceAdminParticipant;
  selectedRevision?: number;
  onChoose: (revision: number) => void;
}) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {participant.revisions.map((revision) => (
      <Button
        key={revision.revision}
        size="sm"
        variant={revision.revision === selectedRevision ? 'primary' : 'outline'}
        onClick={() => onChoose(revision.revision)}
      >
        Revision {revision.revision}
      </Button>
    ))}
  </div>
);

const CalibrationForm = ({
  participant,
  busy,
  onSave,
}: {
  participant: PerformanceAdminParticipant;
  busy: boolean;
  onSave: (input: { finalRating: string; performanceBand: string; reason: string }) => void;
}) => {
  const [finalRating, setFinalRating] = useState(participant.finalRating ?? '');
  const [performanceBand, setPerformanceBand] = useState(participant.performanceBand ?? '');
  const [reason, setReason] = useState('');
  return (
    <div className="mt-4 grid gap-2 rounded-md border border-line p-3 md:grid-cols-3">
      <input
        aria-label="Calibration rating"
        className={fieldClass}
        disabled={busy}
        placeholder="Final rating"
        value={finalRating}
        onChange={(event) => setFinalRating(event.target.value)}
      />
      <input
        aria-label="Calibration band"
        className={fieldClass}
        disabled={busy}
        placeholder="Performance band"
        value={performanceBand}
        onChange={(event) => setPerformanceBand(event.target.value)}
      />
      <input
        aria-label="Calibration reason"
        className={fieldClass}
        disabled={busy}
        placeholder="Required decision reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <Button
        disabled={!finalRating.trim() || !reason.trim()}
        busy={busy}
        onClick={() => onSave({ finalRating, performanceBand, reason })}
      >
        Save calibration
      </Button>
    </div>
  );
};

const ExclusionForm = ({
  participant,
  busy,
  onSave,
}: {
  participant: PerformanceAdminParticipant;
  busy: boolean;
  onSave: (reason: string) => void;
}) => {
  const [reason, setReason] = useState(participant.exclusionReason ?? '');
  const label = participant.isExcluded ? 'Restore participant' : 'Exclude participant';
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <input
        aria-label="Exclusion reason"
        className={fieldClass}
        disabled={busy}
        placeholder="Required reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <Button
        variant={participant.isExcluded ? 'outline' : 'danger'}
        disabled={!reason.trim()}
        busy={busy}
        onClick={() => onSave(reason)}
      >
        {label}
      </Button>
    </div>
  );
};

const ReopenForm = ({
  participant,
  busy,
  onSave,
}: {
  participant: PerformanceAdminParticipant;
  busy: boolean;
  onSave: (input: {
    correctionStage: 'SELF_REVIEW' | 'MANAGER_REVIEW';
    reason: string;
  }) => Promise<boolean>;
}) => {
  const [correctionStage, setCorrectionStage] = useState<'SELF_REVIEW' | 'MANAGER_REVIEW'>(
    'SELF_REVIEW'
  );
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <div className="mt-4 rounded-md border border-warning p-3 text-sm">
      <p>
        Reopening creates revision {participant.responseRevision + 1}; submissions, calibration,
        acknowledgement and KPI evidence downstream of the selected stage reset.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <select
          aria-label="Correction stage"
          className={fieldClass}
          disabled={busy}
          value={correctionStage}
          onChange={(event) =>
            setCorrectionStage(event.target.value as 'SELF_REVIEW' | 'MANAGER_REVIEW')
          }
        >
          <option value="SELF_REVIEW">Self review</option>
          <option value="MANAGER_REVIEW">Manager review</option>
        </select>
        <input
          aria-label="Reopen reason"
          className={fieldClass}
          disabled={busy}
          placeholder="Required reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <Button variant="danger" disabled={!reason.trim()} onClick={() => setConfirmOpen(true)}>
          Reopen review
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Open a new review revision?"
        description="The existing revision remains available as history. The selected correction stage and all downstream completion evidence must be completed again."
        confirmLabel="Reopen review"
        tone="danger"
        busy={busy}
        onConfirm={async () => {
          await onSave({ correctionStage, reason });
        }}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
};

const PrivateFeedback = ({
  feedback,
  nextCursor,
  busy,
  onAdd,
  onLoadMore,
}: {
  feedback: PerformanceFeedbackRow[];
  nextCursor?: string | null;
  busy: boolean;
  onAdd: (comments: string) => void;
  onLoadMore: () => void;
}) => {
  const [comments, setComments] = useState('');
  return (
    <div className="mt-4 rounded-md border border-line p-3">
      <h3 className="font-semibold">Private HR feedback</h3>
      <p className="mt-1 text-sm text-content-secondary">
        Visible only to performance administrators.
      </p>
      {feedback.map((item) => (
        <p key={item.id} className="mt-2 rounded bg-surface-selected p-2 text-sm">
          {item.observationDate} · {item.comments}
        </p>
      ))}
      <div className="mt-3 flex gap-2">
        <input
          aria-label="Private HR feedback"
          className={fieldClass}
          disabled={busy}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
        />
        <Button
          disabled={!comments.trim()}
          busy={busy}
          onClick={() => {
            onAdd(comments);
            setComments('');
          }}
        >
          Add private feedback
        </Button>
      </div>
      {nextCursor && (
        <Button className="mt-2" size="sm" variant="outline" disabled={busy} onClick={onLoadMore}>
          Load more feedback
        </Button>
      )}
    </div>
  );
};

interface Props {
  currentStage: string;
  participant: PerformanceAdminParticipant;
  revisionDetail: PerformanceRevisionDetailRow | null;
  feedback: PerformanceFeedbackRow[];
  nextFeedbackCursor?: string | null;
  isBusy: (key: string) => boolean;
  onChooseRevision: (revision: number) => void;
  onSaveCalibration: (input: {
    finalRating: string;
    performanceBand: string;
    reason: string;
  }) => void;
  onReopen: (input: {
    correctionStage: 'SELF_REVIEW' | 'MANAGER_REVIEW';
    reason: string;
  }) => Promise<boolean>;
  onSetExcluded: (reason: string) => void;
  onAddPrivateFeedback: (comments: string) => void;
  onLoadMoreFeedback: () => void;
}

const PerformanceAdministrationParticipant = ({
  currentStage,
  participant,
  revisionDetail,
  feedback,
  nextFeedbackCursor,
  isBusy,
  onChooseRevision,
  onSaveCalibration,
  onReopen,
  onSetExcluded,
  onAddPrivateFeedback,
  onLoadMoreFeedback,
}: Props) => {
  const calibrationBusy = isBusy(`calibration:${participant.participantId}`);
  const reopenBusy = isBusy(`reopen:${participant.participantId}`);
  const exclusionBusy = isBusy(`exclude:${participant.participantId}`);
  const feedbackBusy = isBusy(`private-feedback:${participant.participantId}`);
  return (
    <Card title={`${participant.employeeName} · revision ${participant.responseRevision}`}>
      <p className="text-sm text-content-secondary">
        Status: {participant.status}
        {participant.isExcluded
          ? ` · excluded: ${participant.exclusionReason ?? 'Reason recorded'}`
          : ''}
      </p>
      <RevisionSelector
        participant={participant}
        selectedRevision={revisionDetail?.review.revision}
        onChoose={onChooseRevision}
      />
      <RevisionReadout detail={revisionDetail} />
      {currentStage === 'CALIBRATION' && (
        <CalibrationForm
          participant={participant}
          busy={calibrationBusy}
          onSave={onSaveCalibration}
        />
      )}
      {currentStage === 'GOAL_SETTING' ? (
        <ExclusionForm participant={participant} busy={exclusionBusy} onSave={onSetExcluded} />
      ) : (
        <p className="mt-4 text-sm text-content-secondary">
          Exclusion is locked after self review begins.
        </p>
      )}
      <ReopenForm participant={participant} busy={reopenBusy} onSave={onReopen} />
      <PrivateFeedback
        feedback={feedback}
        nextCursor={nextFeedbackCursor}
        busy={feedbackBusy}
        onAdd={onAddPrivateFeedback}
        onLoadMore={onLoadMoreFeedback}
      />
    </Card>
  );
};

export default PerformanceAdministrationParticipant;
