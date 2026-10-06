import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import PageInformation from '../../../components/common/PageInformation';
import Select from '../../../components/common/Select';
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
    <PageHeader
      title="Leave configuration"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Leave configuration section"
            data-tour-anchor="leave-settings.sections"
            value={tab}
            options={LEAVE_SETTINGS_TABS.map((item) => ({ value: item.key, label: item.label }))}
            onChange={(event) => {
              const selected = LEAVE_SETTINGS_TABS.find((item) => item.key === event.target.value);
              if (selected) onTabChange(selected.key);
            }}
          />
          <Button
            data-tour-anchor="leave-settings.refresh"
            variant="outline"
            type="button"
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      }
    />
    <PageInformation title="Leave configuration">
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Manage master leave types, per-type policies, employee balances, and public holiday
        calendars. Requires <span className="font-mono text-xs">leave:manage</span>.
      </p>
    </PageInformation>
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
