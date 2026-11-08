import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FeedbackToast from '../../components/common/FeedbackToast';
import Input from '../../components/common/Input';
import { guidanceNavigationBlocked } from '../../guidance/tourNavigation';
import { useFeedbackState } from '../../hooks/useFeedbackState';

import CompanyLocationPicker from './CompanyLocationPicker';
import { useWeeklyOffSettings } from './useWeeklyOffSettings';
import WeeklyOffRuleFields from './WeeklyOffRuleFields';

const PolicyEditor = ({ locationId }: { locationId: string }) => {
  const model = useWeeklyOffSettings(locationId);
  const { policy, busy } = model;
  if (model.loading) return <p>Loading working calendar...</p>;
  if (!policy)
    return (
      <FeedbackToast
        variant={'error'}
        action={
          <>
            <Button onClick={model.reload}>Reload</Button>
          </>
        }
      >
        {model.error ?? 'Unable to load calendar.'}
      </FeedbackToast>
    );
  return (
    <div
      className="space-y-4"
      data-tour-anchor="attendance-policy.weekly-offs"
      data-guidance-dirty={model.dirty}
    >
      <p className="text-sm">
        Company business date: {policy.businessDate}. Activation:{' '}
        {policy.activationDate ?? 'Pending'} · revision {policy.revision}.
      </p>
      {!policy.activationDate ? (
        <>
          <p>
            Activate today's calendar with Saturday and Sunday off. Existing records retain their
            earlier rules. You can then save a different company default or location override.
          </p>
          <Button disabled={busy} onClick={() => void model.activate()}>
            Activate Working Calendar
          </Button>
        </>
      ) : (
        <>
          {locationId ? (
            <label className="block text-sm">
              <input
                type="checkbox"
                checked={model.inherits}
                disabled={busy}
                onChange={(event) => model.setInherits(event.target.checked)}
              />{' '}
              Inherit company default from the effective date
            </label>
          ) : null}
          <Input
            label="Effective from"
            type="date"
            min={policy.businessDate}
            value={model.effective}
            onChange={(event) => model.setEffective(event.target.value)}
            disabled={busy}
            required
          />
          <WeeklyOffRuleFields model={model} />
          <div className="flex flex-wrap items-end gap-3">
            <Input
              label="Preview month"
              type="month"
              value={model.month}
              onChange={(event) => model.setMonth(event.target.value)}
              disabled={busy || model.inherits}
            />
            <Button
              variant="outline"
              disabled={busy || model.inherits}
              onClick={() => void model.requestPreview()}
            >
              Preview Off Dates
            </Button>
            <Button disabled={busy || !model.effective} onClick={() => void model.save()}>
              Save Weekly-Off Policy
            </Button>
            <Button variant="outline" disabled={busy} onClick={model.reload}>
              Reload
            </Button>
          </div>
          {model.preview.length ? (
            <p aria-live="polite">Weekly offs: {model.preview.join(', ')}</p>
          ) : null}
          {policy.currentVersion ? (
            <p className="text-sm">
              Current version effective from {policy.currentVersion.effectiveFrom}
              {policy.currentVersion.inheritsDefault ? ' · inherits company default' : ''}.
            </p>
          ) : (
            <p className="text-sm">This location currently inherits the company default.</p>
          )}
          {policy.scheduledVersions.map((version) => (
            <p key={version.id} className="text-sm">
              Scheduled from {version.effectiveFrom}:{' '}
              {version.inheritsDefault
                ? 'company default'
                : `weekdays ${version.fixedWeekdays.join(', ') || 'none'}; Saturday ordinals ${version.saturdayOrdinals.join(', ') || 'none'}`}
            </p>
          ))}
        </>
      )}
      {model.error ? (
        <FeedbackToast variant={'error'} messageKey={model.error}>
          {model.error}
        </FeedbackToast>
      ) : null}
      {model.success ? (
        <FeedbackToast variant={'success'} messageKey={model.success}>
          {model.success}
        </FeedbackToast>
      ) : null}
    </div>
  );
};
const WeeklyOffSettings = () => {
  const [locationId, setLocationId] = useState('');
  const [notice, setNotice] = useFeedbackState<string | null>(null, 'info');
  return (
    <Card title="Location Working Calendars">
      <div className="space-y-4">
        <CompanyLocationPicker
          value={locationId}
          onChange={(next) => {
            if (guidanceNavigationBlocked()) {
              setNotice('Save or reload your weekly-off changes before switching policy scope.');
              return;
            }
            setNotice(null);
            setLocationId(next);
          }}
          label="Policy scope"
        />
        {notice ? (
          <FeedbackToast variant={'info'} messageKey={notice}>
            {notice}
          </FeedbackToast>
        ) : null}
        <PolicyEditor key={locationId} locationId={locationId} />
      </div>
    </Card>
  );
};
export default WeeklyOffSettings;
