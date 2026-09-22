import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';

import type {
  PerformanceAdminCycleRow,
  PerformanceAdminException,
  PerformanceAdminParticipant,
} from '../performanceAdminQueries';

import PerformanceAdministrationParticipant from './PerformanceAdministrationParticipant';
import { usePerformanceAdministration } from './usePerformanceAdministration';

const stageLabel = (stage: string) => stage.replace(/_/g, ' ');

const CycleList = ({
  cycles,
  selectedCycleId,
  nextCursor,
  onSelect,
  onLoadMore,
}: {
  cycles: PerformanceAdminCycleRow[];
  selectedCycleId?: string;
  nextCursor?: string | null;
  onSelect: (reviewCycleId: string) => void;
  onLoadMore: () => void;
}) => (
  <Card title="Cycle administration">
    {cycles.length === 0 ? (
      <p className="text-sm text-content-secondary">No cycles match this program.</p>
    ) : (
      <ul className="divide-y divide-line">
        {cycles.map((cycle) => (
          <li
            key={cycle.reviewCycle.id}
            className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {cycle.reviewCycle.name} · {stageLabel(cycle.currentStage)}
              </p>
              <p className="text-content-secondary">
                {cycle.participantCount} participants · {cycle.excludedParticipantCount} excluded ·{' '}
                {cycle.actionableExceptionCount} exceptions
              </p>
            </div>
            <Button
              size="sm"
              variant={selectedCycleId === cycle.reviewCycle.id ? 'primary' : 'outline'}
              onClick={() => onSelect(cycle.reviewCycle.id)}
            >
              Open
            </Button>
          </li>
        ))}
      </ul>
    )}
    {nextCursor && (
      <Button className="mt-3" size="sm" variant="outline" onClick={onLoadMore}>
        Load more cycles
      </Button>
    )}
  </Card>
);

const ExceptionList = ({
  exceptions,
  isBusy,
  onRetry,
}: {
  exceptions: PerformanceAdminException[];
  isBusy: (key: string) => boolean;
  onRetry: (exception: PerformanceAdminException) => void;
}) => (
  <Card title="Actionable transition exceptions">
    {exceptions.length === 0 ? (
      <p className="text-sm text-content-secondary">No unresolved exceptions.</p>
    ) : (
      <ul className="divide-y divide-line">
        {exceptions.map((exception) => (
          <li
            key={exception.id}
            className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{exception.exceptionCode}</p>
              <p className="text-content-secondary">{exception.details}</p>
            </div>
            <Button
              size="sm"
              busy={isBusy(`retry:${exception.id}`)}
              onClick={() => onRetry(exception)}
            >
              Retry
            </Button>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

const ParticipantList = ({
  participants,
  selectedParticipantId,
  nextCursor,
  onSelect,
  onLoadMore,
}: {
  participants: PerformanceAdminParticipant[];
  selectedParticipantId?: string;
  nextCursor?: string | null;
  onSelect: (participant: PerformanceAdminParticipant) => void;
  onLoadMore: () => void;
}) => (
  <Card title="Participants">
    <ul className="divide-y divide-line">
      {participants.map((participant) => (
        <li
          key={participant.participantId}
          className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
        >
          <div>
            <p className="font-medium">{participant.employeeName}</p>
            <p className="text-content-secondary">
              {participant.status} · revision {participant.responseRevision}
              {participant.isExcluded ? ' · excluded' : ''}
            </p>
          </div>
          <Button
            size="sm"
            variant={selectedParticipantId === participant.participantId ? 'primary' : 'outline'}
            onClick={() => onSelect(participant)}
          >
            Manage
          </Button>
        </li>
      ))}
    </ul>
    {nextCursor && (
      <Button className="mt-3" size="sm" variant="outline" onClick={onLoadMore}>
        Load more participants
      </Button>
    )}
  </Card>
);

interface Props {
  performanceProgramId?: string;
}

const PerformanceAdministrationPanel = ({ performanceProgramId }: Props) => {
  const administration = usePerformanceAdministration({ performanceProgramId });
  const current = administration.administration;
  const selected = administration.selectedParticipant;
  return (
    <div className="space-y-4">
      {administration.message && (
        <p
          role={administration.message.kind === 'error' ? 'alert' : 'status'}
          className="text-sm text-content-secondary"
        >
          {administration.message.text}
        </p>
      )}
      <CycleList
        cycles={administration.cycles}
        selectedCycleId={current?.reviewCycle.id}
        nextCursor={administration.nextCycleCursor}
        onSelect={administration.selectCycle}
        onLoadMore={() => {
          void administration.loadMoreCycles();
        }}
      />
      {current && (
        <>
          <Card title={`${current.reviewCycle.name} · ${stageLabel(current.currentStage)}`}>
            <p className="text-sm text-content-secondary">
              Deadlines:{' '}
              {current.deadlines
                .map((deadline) => `${stageLabel(deadline.stage)} ${deadline.dueDate}`)
                .join(' · ') || 'None configured'}
            </p>
          </Card>
          <ExceptionList
            exceptions={current.exceptions}
            isBusy={administration.isBusy}
            onRetry={(exception) => {
              void administration.retryException(exception);
            }}
          />
          <ParticipantList
            participants={current.participants}
            selectedParticipantId={selected?.participantId}
            nextCursor={current.nextParticipantCursor}
            onSelect={administration.selectParticipant}
            onLoadMore={() => {
              void administration.loadMoreParticipants();
            }}
          />
        </>
      )}
      {current && selected && (
        <PerformanceAdministrationParticipant
          currentStage={current.currentStage}
          participant={selected}
          revisionDetail={administration.revisionDetail}
          feedback={administration.privateFeedback}
          nextFeedbackCursor={administration.nextFeedbackCursor}
          isBusy={administration.isBusy}
          onChooseRevision={administration.chooseRevision}
          onSaveCalibration={(input) => {
            void administration.saveCalibration({
              participantId: selected.participantId,
              expectedRevision: selected.responseRevision,
              ...input,
            });
          }}
          onReopen={(input) =>
            administration.reopenReview({
              participantId: selected.participantId,
              expectedRevision: selected.responseRevision,
              ...input,
            })
          }
          onSetExcluded={(reason) => {
            void administration.setExcluded({
              participantId: selected.participantId,
              excluded: !selected.isExcluded,
              reason,
            });
          }}
          onAddPrivateFeedback={(comments) => {
            void administration.addPrivateFeedback({
              participantId: selected.participantId,
              observationDate: new Date().toISOString().slice(0, 10),
              comments,
            });
          }}
          onLoadMoreFeedback={() => {
            void administration.loadMoreFeedback();
          }}
        />
      )}
    </div>
  );
};

export default PerformanceAdministrationPanel;
