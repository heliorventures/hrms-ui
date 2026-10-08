import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import type { AppraisalTemplateRow, PerformanceProgramRow } from './performanceLifecycleQueries';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

interface Props {
  activeProgram?: PerformanceProgramRow;
  isBusy: (key: string) => boolean;
  launchTemplateId: string;
  onLaunch: () => void;
  onPeriodDateChange: (date: string) => void;
  onProgramChange: (programId: string) => void;
  onTemplateChange: (templateId: string) => void;
  periodDate: string;
  programs: PerformanceProgramRow[];
  publishedTemplates: AppraisalTemplateRow[];
  selectedProgram: string;
}

const PerformanceCycleLaunchCards = ({
  activeProgram,
  isBusy,
  launchTemplateId,
  onLaunch,
  onPeriodDateChange,
  onProgramChange,
  onTemplateChange,
  periodDate,
  programs,
  publishedTemplates,
  selectedProgram,
}: Props) => {
  const canLaunch = activeProgram?.status === 'ACTIVE' && publishedTemplates.length > 0;

  return (
    <>
      <Card title="Process">
        <label className="text-sm">
          Performance program
          <select
            className={fieldClass}
            value={selectedProgram}
            onChange={(event) => onProgramChange(event.target.value)}
          >
            <option value="">Select program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name} · {program.status}
              </option>
            ))}
          </select>
        </label>
        {!canLaunch && (
          <p className="mt-3 text-sm text-content-secondary">
            Activate a program and publish its appraisal template in Setup before launching a cycle.
          </p>
        )}
      </Card>
      {canLaunch && (
        <Card title="Launch appraisal cycle">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              Published template
              <select
                className={fieldClass}
                value={launchTemplateId}
                onChange={(event) => onTemplateChange(event.target.value)}
              >
                {publishedTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} v{template.version}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Period date
              <input
                type="date"
                className={fieldClass}
                value={periodDate}
                onChange={(event) => onPeriodDateChange(event.target.value)}
              />
            </label>
            <div className="self-end">
              <Button busy={isBusy(`launch-cycle:${selectedProgram}`)} onClick={onLaunch}>
                Launch cycle
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default PerformanceCycleLaunchCards;
