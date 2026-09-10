import Button from '../../../components/common/Button';
import PageActions from '../../../components/common/PageActions';
import PageInformation from '../../../components/common/PageInformation';
import { TAB_LIST_CLASS, tabClassName } from '../../../components/common/tabStyles';
import type { AdminLeaveSettingsModel } from '../hooks/useAdminLeaveSettings';
import type { LeaveSettingsTabKey } from '../leaveSettingsTypes';
import { LEAVE_SETTINGS_TABS } from '../leaveSettingsUtils';

interface LeaveSettingsHeaderProps {
  loading: boolean;
  tab: LeaveSettingsTabKey;
  onTabChange: (tab: LeaveSettingsTabKey) => void;
  onRefresh: () => void;
}

const LeaveSettingsHeader = ({
  loading,
  tab,
  onTabChange,
  onRefresh,
}: LeaveSettingsHeaderProps) => (
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

    <div className={TAB_LIST_CLASS}>
      {LEAVE_SETTINGS_TABS.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-pressed={tab === item.key}
          className={tabClassName(tab === item.key)}
          onClick={() => onTabChange(item.key)}
        >
          {item.label}
        </button>
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
