import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Table from '../../../components/common/Table';
import type { AdminLeaveSettingsModel } from '../hooks/useAdminLeaveSettings';
import { formatLeaveTypeFlags } from '../leaveSettingsUtils';

interface LeaveTypesSectionProps {
  model: AdminLeaveSettingsModel;
}

const LeaveTypesSection = ({ model }: LeaveTypesSectionProps) => (
  <Card title="Leave Types">
    <div className="mb-4">
      <Button type="button" variant="primary" className="!text-sm" onClick={model.openNewType}>
        Add Leave Type
      </Button>
    </div>
    <Table
      data={model.data?.leaveTypes ?? []}
      keyExtractor={(row) => row.id}
      loading={model.loading}
      loadingMessage="Loading Leave Types..."
      emptyMessage="No Leave Types."
      columns={[
        { key: 'code', label: 'Code', render: (row) => row.code },
        { key: 'name', label: 'Name', render: (row) => row.name },
        {
          key: 'flags',
          label: 'Flags',
          render: (row) => (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {formatLeaveTypeFlags(row)}
            </span>
          ),
        },
        {
          key: 'actions',
          label: '',
          render: (row) => (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="!py-1 !text-xs"
                onClick={() => model.openEditType(row)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                className="!py-1 !text-xs"
                onClick={() => void model.deleteType(row.id)}
              >
                Delete
              </Button>
            </div>
          ),
        },
      ]}
    />
    <LeaveTypeModal model={model} />
  </Card>
);

const LeaveTypeModal = ({ model }: LeaveTypesSectionProps) => {
  const form = model.typeForm;
  return (
    <Modal
      isOpen={model.typeModal}
      onClose={() => model.setTypeModal(false)}
      title={model.editTypeId ? 'Edit leave type' : 'New leave type'}
    >
      <form className="space-y-3" onSubmit={(event) => void model.saveType(event)}>
        <Input
          label="Name"
          value={form.name}
          onChange={(event) => model.setTypeForm({ ...form, name: event.target.value })}
          fullWidth
          required
        />
        <Input
          label="Code"
          value={form.code}
          onChange={(event) => model.setTypeForm({ ...form, code: event.target.value })}
          fullWidth
          required
        />
        <LeaveTypeCheckboxes model={model} />
        <Input
          label="Max Carry-Forward Days"
          value={form.maxCf}
          onChange={(event) => model.setTypeForm({ ...form, maxCf: event.target.value })}
          fullWidth
        />
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => model.setTypeModal(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const LeaveTypeCheckboxes = ({ model }: LeaveTypesSectionProps) => {
  const form = model.typeForm;
  const set = model.setTypeForm;
  return (
    <>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isPaid}
          onChange={(event) => set({ ...form, isPaid: event.target.checked })}
        />
        Paid leave
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.carryForward}
          onChange={(event) => set({ ...form, carryForward: event.target.checked })}
        />
        Carry Forward
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.sandwich}
          onChange={(event) => set({ ...form, sandwich: event.target.checked })}
        />
        Sandwich rule
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.halfDay}
          onChange={(event) => set({ ...form, halfDay: event.target.checked })}
        />
        Half-day allowed
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.reqDoc}
          onChange={(event) => set({ ...form, reqDoc: event.target.checked })}
        />
        Requires document reference on apply
      </label>
    </>
  );
};

export default LeaveTypesSection;
