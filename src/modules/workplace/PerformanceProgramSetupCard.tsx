import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import type { PerformanceProgramRow } from './performanceLifecycleQueries';
import type { PerformanceProgramDraft } from './usePerformanceProgramActions';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

interface Props {
  activeProgram?: PerformanceProgramRow;
  isBusy: (key: string) => boolean;
  onActivate: (programId: string) => void;
  onDraftChange: (draft: PerformanceProgramDraft) => void;
  onSave: () => void;
  onSelectedProgramChange: (programId: string) => void;
  programDraft: PerformanceProgramDraft;
  programs: PerformanceProgramRow[];
  selectedProgram: string;
}

const PerformanceProgramSetupCard = ({
  activeProgram,
  isBusy,
  onActivate,
  onDraftChange,
  onSave,
  onSelectedProgramChange,
  programDraft,
  programs,
  selectedProgram,
}: Props) => (
  <Card title="Performance programs">
    <div className="grid gap-3 md:grid-cols-3">
      <label className="text-sm">
        Process name
        <input
          className={fieldClass}
          value={programDraft.name}
          onChange={(event) => onDraftChange({ ...programDraft, name: event.target.value })}
        />
      </label>
      <label className="text-sm">
        Cadence
        <select
          className={fieldClass}
          value={programDraft.cadence}
          onChange={(event) => onDraftChange({ ...programDraft, cadence: event.target.value })}
        >
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="YEARLY">Yearly</option>
          <option value="MANUAL">Manual</option>
        </select>
      </label>
      <label className="text-sm">
        Anchor date
        <input
          type="date"
          className={fieldClass}
          value={programDraft.anchorDate}
          onChange={(event) => onDraftChange({ ...programDraft, anchorDate: event.target.value })}
        />
      </label>
    </div>
    <div className="mt-3 flex flex-wrap gap-4 text-sm">
      <label>
        <input
          type="checkbox"
          checked={programDraft.includeCalibration}
          onChange={(event) =>
            onDraftChange({ ...programDraft, includeCalibration: event.target.checked })
          }
        />{' '}
        HR calibration
      </label>
      <label>
        <input
          type="checkbox"
          checked={programDraft.includeAcknowledgement}
          onChange={(event) =>
            onDraftChange({ ...programDraft, includeAcknowledgement: event.target.checked })
          }
        />{' '}
        Employee acknowledgement
      </label>
      <Button size="sm" busy={isBusy('save-program')} onClick={onSave}>
        Save process
      </Button>
    </div>
    {programs.length > 0 && (
      <div className="mt-4 space-y-2">
        <label className="text-sm">
          Configure process
          <select
            className={fieldClass}
            value={selectedProgram}
            onChange={(event) => onSelectedProgramChange(event.target.value)}
          >
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name} · {program.cadence} · {program.status}
              </option>
            ))}
          </select>
        </label>
        {activeProgram?.status === 'DRAFT' && (
          <Button
            size="sm"
            variant="outline"
            busy={isBusy(`activate-program:${selectedProgram}`)}
            onClick={() => onActivate(selectedProgram)}
          >
            Activate process
          </Button>
        )}
      </div>
    )}
  </Card>
);

export default PerformanceProgramSetupCard;
