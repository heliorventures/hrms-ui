import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Table from '../../../components/common/Table';
import type { AdminLeaveSettingsModel } from '../hooks/useAdminLeaveSettings';
import {
  ACCRUAL_FREQUENCY_OPTIONS,
  formatLeavePolicyAccrual,
  selectFieldClass,
} from '../leaveSettingsUtils';

interface LeavePoliciesSectionProps {
  model: AdminLeaveSettingsModel;
}

const LeavePoliciesSection = ({ model }: LeavePoliciesSectionProps) => (
  <Card title="Leave policies">
    <div className="mb-4">
      <Button type="button" variant="primary" className="!text-sm" onClick={model.openNewPolicy}>
        Add policy
      </Button>
    </div>
    <Table
      data={model.data?.leavePolicies ?? []}
      keyExtractor={(row) => row.id}
      loading={model.loading}
      loadingMessage="Loading policies..."
      emptyMessage="No policies."
      columns={[
        {
          key: 'leaveType',
          label: 'Leave type',
          render: (row) => model.leaveTypeCodeById.get(row.leaveTypeId) ?? row.leaveTypeId.slice(0, 8),
        },
        { key: 'freq', label: 'Accrual', render: formatLeavePolicyAccrual },
        { key: 'entitlement', label: 'Annual', render: (row) => row.annualEntitlement ?? '-' },
        { key: 'max', label: 'Max consec.', render: (row) => row.maxConsecutiveDays ?? '-' },
        {
          key: 'actions',
          label: '',
          render: (row) => (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="!py-1 !text-xs"
                onClick={() => model.openEditPolicy(row)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                className="!py-1 !text-xs"
                onClick={() => void model.deletePolicy(row.id)}
              >
                Delete
              </Button>
            </div>
          ),
        },
      ]}
    />
    <LeavePolicyModal model={model} />
  </Card>
);

const LeavePolicyModal = ({ model }: LeavePoliciesSectionProps) => {
  const form = model.policyForm;
  return (
    <Modal
      isOpen={model.policyModal}
      onClose={() => model.setPolicyModal(false)}
      title={model.editPolicyId ? 'Edit policy' : 'New policy'}
    >
      <form className="space-y-3" onSubmit={(event) => void model.savePolicy(event)}>
        <label className="block text-sm font-medium">Leave type</label>
        <select
          className={selectFieldClass}
          value={form.leaveTypeId}
          onChange={(event) => model.setPolicyForm({ ...form, leaveTypeId: event.target.value })}
          required
        >
          {model.data?.leaveTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} ({type.code})
            </option>
          ))}
        </select>
        <Input
          label="Applicable to (optional)"
          value={form.applicableTo}
          onChange={(event) => model.setPolicyForm({ ...form, applicableTo: event.target.value })}
          fullWidth
        />
        <Input
          label="Annual entitlement (days)"
          value={form.annual}
          onChange={(event) => model.setPolicyForm({ ...form, annual: event.target.value })}
          fullWidth
        />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Accrual frequency
        </label>
        <select
          className={selectFieldClass}
          value={form.freq}
          onChange={(event) => model.setPolicyForm({ ...form, freq: event.target.value })}
        >
          {ACCRUAL_FREQUENCY_OPTIONS.map((option) => (
            <option key={option.value || 'none'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          For days per month, choose Monthly and enter monthly days below.
        </p>
        <Input
          label="Accrual days (decimal string)"
          value={form.accrualDays}
          onChange={(event) => model.setPolicyForm({ ...form, accrualDays: event.target.value })}
          fullWidth
        />
        <Input
          label="Max consecutive days"
          value={form.maxCons}
          onChange={(event) => model.setPolicyForm({ ...form, maxCons: event.target.value })}
          fullWidth
        />
        <Input
          label="Min notice days"
          value={form.minNotice}
          onChange={(event) => model.setPolicyForm({ ...form, minNotice: event.target.value })}
          fullWidth
        />
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => model.setPolicyModal(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeavePoliciesSection;
