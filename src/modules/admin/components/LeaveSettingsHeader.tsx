import Button from '../../../components/common/Button';
import PageActions from '../../../components/common/PageActions';
import PageInformation from '../../../components/common/PageInformation';
import type { AdminLeaveSettingsModel } from '../hooks/useAdminLeaveSettings';
import type { LeaveSettingsTabKey } from '../leaveSettingsTypes';
import { LEAVE_SETTINGS_TABS } from '../leaveSettingsUtils';

interface LeaveSettingsHeaderProps {
  loading: boolean;
  tab: LeaveSettingsTabKey;
  onTabChange: (tab: LeaveSettingsTabKey) => void;
  onRefresh: () => void;
}

const LeaveSettingsHeader = ({ loading, tab, onTabChange, onRefresh }: LeaveSettingsHeaderProps) => (
  <>
    <PageActions>
      <div>
        <h1 className="sr-only">Leave configuration</h1>
        <PageInformation title="Leave configuration">
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage master leave types, per-type policies, employee balances, and public holiday
            calendars. Requires <span className="font-mono text-xs">leave:manage</span>.
          </p>
        </PageInformation>
      </div>
      <Button variant="outline" type="button" onClick={onRefresh} disabled={loading}>
        Refresh
      </Button>
    </PageActions>

    <div className="flex flex-wrap gap-2">
      {LEAVE_SETTINGS_TABS.map((item) => (
        <Button
          key={item.key}
          type="button"
          variant={tab === item.key ? 'primary' : 'outline'}
          className="!py-1.5 !text-sm"
          onClick={() => onTabChange(item.key)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  </>
);

export const LeaveSettingsHeaderFromModel = ({ model }: { model: AdminLeaveSettingsModel }) => (
  <LeaveSettingsHeader
    loading={model.loading}
    tab={model.tab}
    onTabChange={model.setTab}
    onRefresh={() => void model.refresh()}
  />
);

export default LeaveSettingsHeader;
