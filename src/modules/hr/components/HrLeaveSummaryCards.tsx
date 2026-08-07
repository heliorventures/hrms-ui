import Card from '../../../components/common/Card';
import type { LeaveBoardQuery } from '../../../api/graphql/graphql';

interface HrLeaveSummaryCardsProps {
  balanceYear: number;
  balances: LeaveBoardQuery['leaveBalances'];
  leaveTypeNameById: Map<string, string>;
  limit: number;
  loading: boolean;
  pendingCount: number;
  yearChoices: number[];
  onYearChange: (year: number) => void;
}

const HrLeaveSummaryCards = ({
  balanceYear,
  balances,
  leaveTypeNameById,
  limit,
  loading,
  pendingCount,
  yearChoices,
  onYearChange,
}: HrLeaveSummaryCardsProps) => (
  <div className="grid gap-4 sm:grid-cols-3">
    <Card title="Pending approvals">
      {loading ? (
        <p className="text-sm text-gray-500">...</p>
      ) : (
        <p className="text-3xl font-semibold tabular-nums text-amber-700 dark:text-amber-300">
          {pendingCount}
        </p>
      )}
    </Card>
    <Card title="In queue">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing up to <span className="font-mono">{limit}</span> requests in your scope.
      </p>
    </Card>
    <Card
      title={
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span>My balances ({balanceYear})</span>
          <select
            value={balanceYear}
            onChange={(event) => onYearChange(Number(event.target.value))}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {yearChoices.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </span>
      }
    >
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : balances.length ? (
        <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
          {balances.map((balance) => (
            <li key={balance.id} className="flex justify-between gap-2">
              <span>{leaveTypeNameById.get(balance.leaveTypeId) ?? 'Leave'}</span>
              <span className="font-mono">{balance.balanceDays} d</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500">No rows for this year.</p>
      )}
    </Card>
  </div>
);

export default HrLeaveSummaryCards;
