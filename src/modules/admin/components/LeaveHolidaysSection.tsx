import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Table from '../../../components/common/Table';
import type { AdminLeaveSettingsModel } from '../hooks/useAdminLeaveSettings';
import { formatDateForTenant, HOLIDAY_TYPE_OPTIONS, selectFieldClass } from '../leaveSettingsUtils';

interface LeaveHolidaysSectionProps {
  model: AdminLeaveSettingsModel;
}

const LeaveHolidaysSection = ({ model }: LeaveHolidaysSectionProps) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <HolidayCalendarsCard model={model} />
    <HolidayDaysCard model={model} />
    <HolidayCalendarModal model={model} />
    <HolidayDayModal model={model} />
  </div>
);

const HolidayCalendarsCard = ({ model }: LeaveHolidaysSectionProps) => (
  <Card title="Calendars">
    <div className="mb-3 flex gap-2">
      <Button type="button" variant="primary" className="!text-sm" onClick={() => model.setCalendarModal(true)}>
        New calendar
      </Button>
    </div>
    {model.loading ? (
      <p className="text-sm text-gray-500">Loading...</p>
    ) : (
      <ul className="space-y-2 text-sm">
        {model.data?.holidayCalendars?.map((calendar) => (
          <li
            key={calendar.id}
            className={`flex cursor-pointer items-center justify-between rounded border px-3 py-2 dark:border-gray-700 ${
              model.selectedCalendarId === calendar.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                : ''
            }`}
            onClick={() => model.setSelectedCalendarId(calendar.id)}
          >
            <span>
              {calendar.name} <span className="text-gray-500">({calendar.year})</span>
            </span>
            <Button
              type="button"
              variant="outline"
              className="!py-0.5 !text-xs"
              onClick={(event) => {
                event.stopPropagation();
                void model.deleteCalendar(calendar.id);
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

const HolidayDaysCard = ({ model }: LeaveHolidaysSectionProps) => (
  <Card title={model.selectedCalendarId ? 'Holidays In Calendar' : 'Select A Calendar'}>
    {model.selectedCalendarId ? (
      <>
        <div className="mb-3">
          <Button type="button" variant="primary" className="!text-sm" onClick={() => model.setHolidayModal(true)}>
            Add Holiday
          </Button>
        </div>
        <Table
          data={model.holidayDays}
          keyExtractor={(row) => row.id}
          loading={model.holidayLoading}
          loadingMessage="Loading Holidays..."
          emptyMessage="No Holidays In This Calendar."
          columns={[
            { key: 'date', label: 'Date', render: (row) => formatDateForTenant(row.holidayDate) },
            { key: 'name', label: 'Name', render: (row) => row.name },
            {
              key: 'actions',
              label: '',
              render: (row) => (
                <Button
                  type="button"
                  variant="outline"
                  className="!py-1 !text-xs"
                  onClick={() => void model.deleteHoliday(row.id)}
                >
                  Remove
                </Button>
              ),
            },
          ]}
        />
      </>
    ) : (
      <p className="text-sm text-gray-500">Choose A Calendar On The Left.</p>
    )}
  </Card>
);

const HolidayCalendarModal = ({ model }: LeaveHolidaysSectionProps) => {
  const form = model.calendarForm;
  return (
    <Modal isOpen={model.calendarModal} onClose={() => model.setCalendarModal(false)} title="New Holiday Calendar">
      <form className="space-y-3" onSubmit={(event) => void model.saveCalendar(event)}>
        <Input
          label="Name"
          value={form.name}
          onChange={(event) => model.setCalendarForm({ ...form, name: event.target.value })}
          fullWidth
          required
        />
        <Input
          label="Year"
          value={form.year}
          onChange={(event) => model.setCalendarForm({ ...form, year: event.target.value })}
          fullWidth
          required
        />
        <Input
          label="Location ID (Optional UUID)"
          value={form.locationId}
          onChange={(event) => model.setCalendarForm({ ...form, locationId: event.target.value })}
          fullWidth
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            Create
          </Button>
          <Button type="button" variant="outline" onClick={() => model.setCalendarModal(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const HolidayDayModal = ({ model }: LeaveHolidaysSectionProps) => {
  const form = model.holidayForm;
  return (
    <Modal isOpen={model.holidayModal} onClose={() => model.setHolidayModal(false)} title="Add Holiday">
      <form className="space-y-3" onSubmit={(event) => void model.saveHoliday(event)}>
        <Input
          type="date"
          label="Date"
          value={form.holidayDate}
          onChange={(event) => model.setHolidayForm({ ...form, holidayDate: event.target.value })}
          fullWidth
          required
        />
        <Input
          label="Name"
          value={form.name}
          onChange={(event) => model.setHolidayForm({ ...form, name: event.target.value })}
          fullWidth
          required
        />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Holiday Type</label>
        <select
          className={selectFieldClass}
          value={form.holidayType}
          onChange={(event) => model.setHolidayForm({ ...form, holidayType: event.target.value })}
        >
          {HOLIDAY_TYPE_OPTIONS.map((option) => (
            <option key={option.value || 'unspecified'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => model.setHolidayModal(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveHolidaysSection;
