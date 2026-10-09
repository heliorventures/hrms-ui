import type { GraphQLClient } from 'graphql-request';

import Button from '../../../../components/common/Button';
import FeedbackToast from '../../../../components/common/FeedbackToast';
import Input from '../../../../components/common/Input';
import PageNotice from '../../../../components/common/PageNotice';
import { useEmployeeUan } from '../hooks/useEmployeeUan';

import { InfoCard } from './InfoCard';

interface EmployeeUanCardProps {
  client: GraphQLClient;
  employeeId: string;
  canEdit: boolean;
  refreshVersion?: number;
  onChanged?: () => void;
}

const EmployeeUanForm = ({ uan }: { uan: ReturnType<typeof useEmployeeUan> }) => (
  <form
    className="space-y-3"
    onSubmit={(event) => {
      event.preventDefault();
      void uan.save();
    }}
  >
    <Input
      label="EPF / UAN number"
      value={uan.draft}
      onChange={(event) => uan.setDraft(event.target.value)}
      inputMode="numeric"
      maxLength={12}
      disabled={uan.saving}
      fullWidth
    />
    <p className="text-xs text-content-secondary">
      Enter 12 digits. Leave blank and save to clear the recorded number.
    </p>
    {!uan.valid ? <FeedbackToast variant={'error'}>Enter exactly 12 digits.</FeedbackToast> : null}
    <div className="flex flex-wrap gap-2">
      <Button type="submit" size="sm" busy={uan.saving} disabled={!uan.canSave}>
        Save EPF / UAN number
      </Button>
      <Button
        type="button"
        size="sm"
        variant="quiet"
        disabled={uan.saving}
        onClick={uan.cancelEditing}
      >
        Cancel
      </Button>
    </div>
  </form>
);

const EmployeeUanNotices = ({ uan }: { uan: ReturnType<typeof useEmployeeUan> }) => (
  <>
    {uan.success ? (
      <FeedbackToast variant={'success'}>EPF / UAN number saved.</FeedbackToast>
    ) : null}
    {uan.error ? (
      <PageNotice
        messageKey={uan.error}
        variant="error"
        title="EPF / UAN number could not be saved"
      >
        {uan.error}
      </PageNotice>
    ) : null}
  </>
);

const EmployeeUanCard = ({
  client,
  employeeId,
  canEdit,
  refreshVersion,
  onChanged,
}: EmployeeUanCardProps) => {
  const uan = useEmployeeUan(client, employeeId, canEdit, onChanged, refreshVersion);
  const loading = uan.query.phase === 'initial-loading';
  const readError = uan.query.error;
  const startLabel = uan.number ? 'Update EPF / UAN number' : 'Add EPF / UAN number';
  const canStartEditing = canEdit && !uan.editing;
  const showEditor = canEdit && uan.editing;

  return (
    <InfoCard title="EPF / UAN number" subtitle="Universal Account Number">
      {loading ? <p role="status">Loading EPF / UAN number…</p> : null}
      {readError ? (
        <PageNotice
          messageKey={readError}
          variant="error"
          title="EPF / UAN number could not be loaded"
        >
          <>{readError}</>
          <Button size="sm" variant="quiet" onClick={() => void uan.query.refresh()}>
            Retry
          </Button>
        </PageNotice>
      ) : null}
      {uan.query.data ? (
        <p className="break-all font-mono text-sm font-semibold text-content-primary">
          {uan.number ?? 'Not recorded'}
        </p>
      ) : null}
      <EmployeeUanNotices uan={uan} />
      {canStartEditing ? (
        <Button size="sm" variant="outline" disabled={!uan.ready} onClick={uan.startEditing}>
          {startLabel}
        </Button>
      ) : null}
      {showEditor ? <EmployeeUanForm uan={uan} /> : null}
    </InfoCard>
  );
};

export default EmployeeUanCard;
