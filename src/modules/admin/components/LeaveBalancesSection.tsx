import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import EmployeeSearchSelect from '../../../components/common/EmployeeSearchSelect';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import type { SearchableSelectAvailability } from '../../../components/common/SearchableSelect';
import type { AdminLeaveSettingsModel } from '../hooks/useAdminLeaveSettings';

interface LeaveBalancesSectionProps {
  model: AdminLeaveSettingsModel;
}

interface EmployeePickerState {
  availability: SearchableSelectAvailability;
  stateMessage?: string;
}

const employeePickerStateFor = (model: AdminLeaveSettingsModel): EmployeePickerState => {
  if (model.data) return { availability: 'ready' };
  if (model.loading) {
    return { availability: 'loading', stateMessage: 'Loading employee options.' };
  }
  if (model.error) {
    return {
      availability: 'unavailable',
      stateMessage: 'Employee options could not be loaded. Refresh leave settings to try again.',
    };
  }
  return { availability: 'unavailable', stateMessage: 'Employee options are unavailable.' };
};

const LeaveBalancesSection = ({ model }: LeaveBalancesSectionProps) => (
  <div className="space-y-6">
    <ProvisionBalancesCard model={model} />
    <div className="grid gap-6 lg:grid-cols-2">
      <BalanceFormCard model={model} />
      <AdjustmentFormCard model={model} />
    </div>
  </div>
);

const ProvisionBalancesCard = ({ model }: LeaveBalancesSectionProps) => (
  <Card title="Provision From Policies (Company-Wide)">
    <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
      Creates or updates leave balance rows for every active employee using each leave type policy.
      Existing used, pending, and carried-forward values are kept.
    </p>
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm">
        <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Year</span>
        <input
          type="number"
          value={model.provisionYear}
          onChange={(event) => model.setProvisionYear(Number(event.target.value))}
          className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </label>
      <Button
        type="button"
        variant="primary"
        disabled={model.provisionBusy || model.loading}
        onClick={() => void model.runProvisionFromPolicies()}
      >
        {model.provisionBusy ? 'Provisioning...' : 'Provision / refresh all'}
      </Button>
    </div>
  </Card>
);

const BalanceFormCard = ({ model }: LeaveBalancesSectionProps) => {
  const form = model.balanceForm;
  const employeePickerState = employeePickerStateFor(model);
  return (
    <Card title="Upsert Balance Row">
      <p className="mb-3 text-xs text-gray-500">
        Sets entitled, used, pending, and carried-forward days. Server recomputes available balance.
      </p>
      <form className="space-y-3" onSubmit={(event) => void model.saveBalance(event)}>
        <EmployeeSearchSelect
          employees={model.data?.employees ?? []}
          valueId={form.employeeId}
          onChangeId={(employeeId) => model.setBalanceForm({ ...form, employeeId })}
          required
          {...employeePickerState}
        />
        <LeaveTypeSelect
          value={form.leaveTypeId}
          leaveTypes={model.data?.leaveTypes ?? []}
          onChange={(leaveTypeId) => model.setBalanceForm({ ...form, leaveTypeId })}
        />
        <Input
          label="Year"
          value={form.year}
          onChange={(e) => model.setBalanceForm({ ...form, year: e.target.value })}
          fullWidth
          required
        />
        <Input
          label="Entitled Days"
          value={form.entitled}
          onChange={(e) => model.setBalanceForm({ ...form, entitled: e.target.value })}
          fullWidth
          required
        />
        <Input
          label="Used Days"
          value={form.used}
          onChange={(e) => model.setBalanceForm({ ...form, used: e.target.value })}
          fullWidth
          required
        />
        <Input
          label="Pending Days"
          value={form.pending}
          onChange={(e) => model.setBalanceForm({ ...form, pending: e.target.value })}
          fullWidth
          required
        />
        <Input
          label="Carried Forward"
          value={form.carried}
          onChange={(e) => model.setBalanceForm({ ...form, carried: e.target.value })}
          fullWidth
          required
        />
        <Button type="submit" variant="primary">
          Save Balance
        </Button>
      </form>
    </Card>
  );
};

const AdjustmentFormCard = ({ model }: LeaveBalancesSectionProps) => {
  const form = model.adjustmentForm;
  const employeePickerState = employeePickerStateFor(model);
  return (
    <Card title="Adjust Entitlement">
      <p className="mb-3 text-xs text-gray-500">
        Adds days to an existing balance row and can credit available balance by the same delta.
      </p>
      <form className="space-y-3" onSubmit={(event) => void model.adjustBalance(event)}>
        <EmployeeSearchSelect
          employees={model.data?.employees ?? []}
          valueId={form.employeeId}
          onChangeId={(employeeId) => model.setAdjustmentForm({ ...form, employeeId })}
          required
          {...employeePickerState}
        />
        <LeaveTypeSelect
          value={form.leaveTypeId}
          leaveTypes={model.data?.leaveTypes ?? []}
          onChange={(leaveTypeId) => model.setAdjustmentForm({ ...form, leaveTypeId })}
        />
        <Input
          label="Year"
          value={form.year}
          onChange={(e) => model.setAdjustmentForm({ ...form, year: e.target.value })}
          fullWidth
          required
        />
        <Input
          label="Entitled Delta (+/- Decimal)"
          value={form.delta}
          onChange={(e) => model.setAdjustmentForm({ ...form, delta: e.target.value })}
          fullWidth
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.alsoCredit}
            onChange={(event) =>
              model.setAdjustmentForm({ ...form, alsoCredit: event.target.checked })
            }
          />
          Also add delta to available balance
        </label>
        <Button type="submit" variant="primary">
          Apply adjustment
        </Button>
      </form>
    </Card>
  );
};

interface LeaveTypeSelectProps {
  value: string;
  leaveTypes: NonNullable<AdminLeaveSettingsModel['data']>['leaveTypes'];
  onChange: (leaveTypeId: string) => void;
}

const LeaveTypeSelect = ({ value, leaveTypes, onChange }: LeaveTypeSelectProps) => (
  <Select
    label="Leave type"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    options={[
      { value: '', label: 'Select...' },
      ...leaveTypes.map((type) => ({ value: type.id, label: type.code })),
    ]}
    required
    fullWidth
  />
);

export default LeaveBalancesSection;
