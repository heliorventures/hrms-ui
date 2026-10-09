import type { GraphQLClient } from 'graphql-request';

import Button from '../../../../components/common/Button';
import FeedbackToast from '../../../../components/common/FeedbackToast';
import Input from '../../../../components/common/Input';
import PageNotice from '../../../../components/common/PageNotice';
import { useEmployeeEsic } from '../hooks/useEmployeeEsic';

import { InfoCard } from './InfoCard';

interface EmployeeEsicCardProps {
  client: GraphQLClient;
  employeeId: string;
  canEdit: boolean;
  refreshVersion?: number;
  onChanged?: () => void;
}

const EmployeeEsicForm = ({ esic }: { esic: ReturnType<typeof useEmployeeEsic> }) => (
  <form
    className="space-y-3"
    onSubmit={(event) => {
      event.preventDefault();
      void esic.save();
    }}
  >
    <Input
      label="ESIC number"
      value={esic.draft}
      onChange={(event) => esic.setDraft(event.target.value)}
      inputMode="numeric"
      maxLength={10}
      description="Enter 10 digits. Leave blank and save to clear the recorded number."
      error={esic.valid ? undefined : 'Enter exactly 10 digits.'}
      disabled={esic.saving}
      fullWidth
    />
    <div className="flex flex-wrap gap-2">
      <Button type="submit" size="sm" busy={esic.saving} disabled={!esic.canSave}>
        Save ESIC number
      </Button>
      <Button
        type="button"
        size="sm"
        variant="quiet"
        disabled={esic.saving}
        onClick={esic.cancelEditing}
      >
        Cancel
      </Button>
    </div>
  </form>
);

const EmployeeEsicNotices = ({ esic }: { esic: ReturnType<typeof useEmployeeEsic> }) => (
  <>
    {esic.success ? <FeedbackToast variant={'success'}>ESIC number saved.</FeedbackToast> : null}
    {esic.error ? (
      <PageNotice messageKey={esic.error} variant="error" title="ESIC number could not be saved">
        {esic.error}
      </PageNotice>
    ) : null}
  </>
);

const EmployeeEsicCard = ({
  client,
  employeeId,
  canEdit,
  refreshVersion,
  onChanged,
}: EmployeeEsicCardProps) => {
  const esic = useEmployeeEsic(client, employeeId, canEdit, onChanged, refreshVersion);
  const loading = esic.query.phase === 'initial-loading';
  const readError = esic.query.error;
  const startLabel = esic.number ? 'Update ESIC number' : 'Add ESIC number';
  const canStartEditing = canEdit && !esic.editing;
  const showEditor = canEdit && esic.editing;

  return (
    <InfoCard title="ESIC number" subtitle="Employees’ State Insurance number">
      {loading ? <p role="status">Loading ESIC number…</p> : null}
      {readError ? (
        <PageNotice messageKey={readError} variant="error" title="ESIC number could not be loaded">
          <>{readError}</>
          <Button size="sm" variant="quiet" onClick={() => void esic.query.refresh()}>
            Retry
          </Button>
        </PageNotice>
      ) : null}
      {esic.query.data ? (
        <p className="break-all font-mono text-sm font-semibold text-content-primary">
          {esic.number ?? 'Not recorded'}
        </p>
      ) : null}
      <EmployeeEsicNotices esic={esic} />
      {canStartEditing ? (
        <Button size="sm" variant="outline" disabled={!esic.ready} onClick={esic.startEditing}>
          {startLabel}
        </Button>
      ) : null}
      {showEditor ? <EmployeeEsicForm esic={esic} /> : null}
    </InfoCard>
  );
};

export default EmployeeEsicCard;
