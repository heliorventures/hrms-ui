import Modal from '../../../components/common/Modal';
import { formatDisplayDate } from '../../../utils/dateDisplay';
import type { AllCompanyHolidaysQuery } from '../../../api/graphql/graphql';

interface AllHolidaysModalProps {
  holidays: AllCompanyHolidaysQuery['upcomingHolidays'];
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
}

const AllHolidaysModal = ({ holidays, isOpen, loading, onClose }: AllHolidaysModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Company Holidays">
    {loading ? (
      <p className="text-sm text-gray-500">Loading...</p>
    ) : holidays.length === 0 ? (
      <p className="text-sm text-gray-500">No Holidays Returned For This Year.</p>
    ) : (
      <ul className="max-h-[60vh] divide-y divide-gray-100 overflow-y-auto text-sm dark:divide-gray-800">
        {holidays.map((holiday) => (
          <li key={holiday.id} className="flex flex-wrap justify-between gap-2 py-2">
            <span className="font-medium text-gray-900 dark:text-white">{holiday.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDisplayDate(holiday.holidayDate)} - {holiday.calendarName}
              {holiday.holidayType ? ` - ${holiday.holidayType}` : ''}
            </span>
          </li>
        ))}
      </ul>
    )}
  </Modal>
);

export default AllHolidaysModal;
