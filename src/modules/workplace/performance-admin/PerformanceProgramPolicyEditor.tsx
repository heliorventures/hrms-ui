import { useState } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

import type { PerformancePopulationMode } from '../performanceAdminQueries';

import {
  PopulationPicker,
  PolicyDeadlines,
} from './PerformanceProgramPolicyFields';
import { fieldClass, modes } from './performanceProgramPolicy';
import { usePerformanceProgramPolicyActions } from './usePerformanceProgramPolicyActions';
import { usePerformanceProgramPolicyData } from './usePerformanceProgramPolicyData';

interface Props {
  performanceProgramId: string;
  programName: string;
  onArchived: () => Promise<void>;
}

const PerformanceProgramPolicyEditor = ({
  performanceProgramId,
  programName,
  onArchived,
}: Props) => {
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const policy = usePerformanceProgramPolicyData({ performanceProgramId });
  const actions = usePerformanceProgramPolicyActions({
    archiveReason,
    draft: policy.draft,
    onArchived,
    performanceProgramId,
    setDraft: policy.setDraft,
    setMessage: policy.setMessage,
  });

  return (
    <Card title={`Policy · ${programName}`}>
      {policy.message && (
        <p role="status" className="mb-3 text-sm text-content-secondary">
          {policy.message}
        </p>
      )}
      <label className="text-sm">
        Population
        <select
          className={fieldClass}
          disabled={actions.busy}
          value={policy.draft.populationMode}
          onChange={(event) =>
            policy.changeMode(event.target.value as PerformancePopulationMode)
          }
        >
          {modes.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </label>
      <PopulationPicker
        mode={policy.draft.populationMode}
        options={policy.options}
        nextCursor={policy.nextCursor}
        search={policy.search}
        selectedIds={policy.draft.populationIds}
        disabled={actions.busy}
        onSearchChange={policy.setSearch}
        onLoadMore={policy.loadMoreOptions}
        onToggle={policy.toggleId}
      />
      <PolicyDeadlines
        draft={policy.draft}
        disabled={actions.busy}
        onChange={(key, value) =>
          policy.setDraft((current) => ({ ...current, [key]: value }))
        }
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button busy={actions.busy} onClick={() => void actions.savePolicy()}>
          Save policy
        </Button>
        <Button variant="danger" disabled={actions.busy} onClick={() => setArchiveOpen(true)}>
          Archive program
        </Button>
      </div>
      <label className="mt-3 block text-sm">
        Archive reason
        <textarea
          aria-label="Archive reason"
          className={fieldClass}
          disabled={actions.busy}
          maxLength={2000}
          rows={2}
          value={archiveReason}
          onChange={(event) => setArchiveReason(event.target.value)}
        />
      </label>
      <ConfirmDialog
        open={archiveOpen}
        title="Archive performance program?"
        description={
          'New manual and scheduled cycles stop. Existing cycles and their recorded history remain available.'
        }
        confirmLabel="Archive program"
        tone="danger"
        busy={actions.busy}
        onConfirm={actions.archiveProgram}
        onOpenChange={setArchiveOpen}
      />
    </Card>
  );
};

export default PerformanceProgramPolicyEditor;
