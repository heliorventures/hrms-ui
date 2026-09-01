import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import PageNotice from '../../../components/common/PageNotice';
import { formatDisplayDate } from '../../../utils/dateDisplay';
import type { AllCompanyHolidaysQuery } from '../../../api/graphql/graphql';

interface AllHolidaysModalProps {
  holidays: AllCompanyHolidaysQuery['upcomingHolidays'];
  failure: string | null;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const AllHolidaysModal = ({
  holidays,
  failure,
  isOpen,
  loading,
  onClose,
  onRetry,
}: AllHolidaysModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Company Holidays">
    <div className="space-y-4">
      {failure ? (
        <PageNotice
          variant="error"
          title="Company holidays could not be loaded"
          action={
            <Button type="button" variant="outline" size="sm" busy={loading} onClick={onRetry}>
              Try again
            </Button>
          }
        >
          {failure}
        </PageNotice>
      ) : null}
      {loading && holidays.length === 0 ? (
        <p role="status" className="text-sm text-content-secondary">
          Loading company holidays…
        </p>
      ) : holidays.length === 0 && !failure ? (
        <p className="text-sm text-content-secondary">No company holidays are scheduled this year.</p>
      ) : null}
      {holidays.length > 0 ? (
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
      ) : null}
    </div>
  </Modal>
);

export default AllHolidaysModal;
