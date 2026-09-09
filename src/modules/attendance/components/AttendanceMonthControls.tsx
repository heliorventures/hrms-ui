import Button from '../../../components/common/Button';

interface Props {
  year: number;
  monthIndex: number;
  currentYear: number;
  refreshing: boolean;
  updateView: (value: Record<string, string>) => void;
  resetCursorStack: () => void;
  refreshBoard: () => void;
}
const AttendanceMonthControls = ({
  year,
  monthIndex,
  currentYear,
  refreshing,
  updateView,
  resetCursorStack,
  refreshBoard,
}: Props) => (
  <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Attendance month">
    <Button
      variant="outline"
      type="button"
      onClick={() => {
        updateView({
          year: String(monthIndex === 0 ? year - 1 : year),
          month: String(monthIndex === 0 ? 12 : monthIndex),
        });
        resetCursorStack();
      }}
    >
      Previous
    </Button>
    <select
      aria-label="Month"
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      value={monthIndex}
      onChange={(e) => {
        updateView({ month: String(Number(e.target.value) + 1) });
        resetCursorStack();
      }}
    >
      {Array.from({ length: 12 }, (_, m) => (
        <option key={m} value={m}>
          {new Date(year, m, 1).toLocaleString('en-IN', { month: 'long' })}
        </option>
      ))}
    </select>
    <select
      aria-label="Year"
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      value={year}
      onChange={(e) => {
        updateView({ year: e.target.value });
        resetCursorStack();
      }}
    >
      {Array.from({ length: 7 }, (_, i) => currentYear - 3 + i).map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
    <Button
      variant="outline"
      type="button"
      onClick={() => {
        updateView({
          year: String(monthIndex === 11 ? year + 1 : year),
          month: String(monthIndex === 11 ? 1 : monthIndex + 2),
        });
        resetCursorStack();
      }}
    >
      Next
    </Button>
    <Button
      variant="outline"
      type="button"
      disabled={refreshing}
      onClick={() => void refreshBoard()}
    >
      {refreshing ? 'Refreshing…' : 'Refresh'}
    </Button>
  </div>
);
export default AttendanceMonthControls;
