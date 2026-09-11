import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import PageNotice from '../../components/common/PageNotice';
import { boundaryTime, formatAttendanceWindow } from '../../utils/attendanceDay';

import {
  useAttendanceDayPolicyDraft,
  type AttendanceDayPolicyDraftOptions,
} from './useAttendanceDayPolicyDraft';

type Props = AttendanceDayPolicyDraftOptions;

const PolicyNotices = ({
  error,
  legacyActivationPending,
  success,
}: {
  error: string | null;
  legacyActivationPending: boolean;
  success: string | null;
}) => (
  <>
    {legacyActivationPending ? (
      <PageNotice variant="warning" title="Initial activation pending">
        Choose a future work date to activate the default boundary without reinterpreting existing
        attendance.
      </PageNotice>
    ) : null}
    {error ? (
      <PageNotice variant="error" title="Attendance day change was not saved">
        {error}
      </PageNotice>
    ) : null}
    {success ? <PageNotice variant="success">{success}</PageNotice> : null}
  </>
);

const AttendanceDayPolicySettings = (props: Props) => {
  const { policy } = props;
  const {
    boundary,
    busy,
    changeDraft,
    confirmed,
    effectiveDate,
    error,
    preview,
    requestPreview,
    schedule,
    setBoundary,
    setConfirmed,
    setEffectiveDate,
    success,
  } = useAttendanceDayPolicyDraft(props);

  return (
    <Card title="Attendance Day Boundary">
      <div className="space-y-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-canvas p-3">
            <p className="font-medium text-content-primary">
              Current start: {boundaryTime(policy.currentPolicy.boundaryMinutes)}
            </p>
            <p className="mt-1 text-content-secondary">
              Effective {policy.currentPolicy.effectiveWorkDate} · {policy.currentPolicy.timezone}
            </p>
          </div>
          <div className="rounded-lg bg-canvas p-3">
            {policy.pendingPolicy ? (
              <>
                <p className="font-medium text-content-primary">
                  Scheduled start: {boundaryTime(policy.pendingPolicy.boundaryMinutes)} from{' '}
                  {policy.pendingPolicy.effectiveWorkDate}
                </p>
                <p className="mt-1 text-content-secondary">{policy.pendingPolicy.timezone}</p>
              </>
            ) : (
              <p className="text-content-secondary">No future boundary change is scheduled.</p>
            )}
          </div>
        </div>

        <p className="text-xs text-content-secondary">
          Active work date {policy.currentWindow.workDate}:{' '}
          {formatAttendanceWindow(policy.currentWindow)}
        </p>
        <PolicyNotices
          error={error}
          legacyActivationPending={policy.legacyActivationPending}
          success={success}
        />

        <form className="space-y-3" onSubmit={(event) => void requestPreview(event)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="time"
              label="Attendance day starts at"
              value={boundary}
              onChange={(event) => changeDraft(() => setBoundary(event.target.value))}
              disabled={busy === 'schedule'}
              fullWidth
              required
            />
            <Input
              type="date"
              label="Effective work date"
              value={effectiveDate}
              onChange={(event) => changeDraft(() => setEffectiveDate(event.target.value))}
              disabled={busy === 'schedule'}
              fullWidth
              required
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={busy !== null || !boundary || !effectiveDate}
          >
            {busy === 'preview' ? 'Loading preview…' : 'Preview change'}
          </Button>
        </form>

        {preview ? (
          <div className="space-y-3 rounded-lg border border-line p-3">
            <div>
              <p className="text-sm font-medium text-content-primary">Transition work date</p>
              <p className="text-sm text-content-secondary">
                {formatAttendanceWindow(preview.transition)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-content-primary">Following work date</p>
              <p className="text-sm text-content-secondary">
                {formatAttendanceWindow(preview.following)}
              </p>
            </div>
            <label className="flex items-start gap-2 text-sm text-content-secondary">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={confirmed}
                disabled={busy !== null}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              I confirm this exact transition interval and timezone.
            </label>
            <Button
              type="button"
              disabled={!confirmed || busy !== null}
              onClick={() => void schedule()}
            >
              {busy === 'schedule' ? 'Scheduling…' : 'Schedule change'}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default AttendanceDayPolicySettings;
