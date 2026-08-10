import Card from '../../../components/common/Card';
import type { LeaveBoardQuery } from '../../../api/graphql/graphql';

interface LeaveBalancesCardProps {
  balanceYear: number;
  balances: LeaveBoardQuery['leaveBalances'];
  leaveTypes: LeaveBoardQuery['leaveTypes'];
  leaveTypeNameById: Map<string, string>;
  loading: boolean;
  yearChoices: number[];
  onYearChange: (year: number) => void;
}

const LeaveBalancesCard = ({
  balanceYear,
  balances,
  leaveTypes,
  leaveTypeNameById,
  loading,
  yearChoices,
  onYearChange,
}: LeaveBalancesCardProps) => (
  <Card
    title={
      <span className="flex flex-wrap items-center justify-between gap-3">
        <span>Leave balances ({balanceYear})</span>
        <label className="flex items-center gap-2 text-xs font-normal text-gray-600 dark:text-gray-400">
          Year
          <select
            value={balanceYear}
            onChange={(event) => onYearChange(Number(event.target.value))}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {yearChoices.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </span>
    }
  >
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading balances...</p>
    ) : leaveTypes.length ? (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
              <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Available</th>
              <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Pending</th>
              <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Used</th>
              <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Entitled</th>
              <th className="py-2 font-medium text-gray-700 dark:text-gray-300">Provisioning</th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.map((leaveType) => {
              const balance = balances.find((row) => row.leaveTypeId === leaveType.id);
              return (
                <tr
                  key={leaveType.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <td className="py-2 pr-4 text-gray-900 dark:text-white">
                    {leaveTypeNameById.get(leaveType.id) ?? leaveType.name}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{balance?.balanceDays ?? '0'}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{balance?.pendingDays ?? '0'}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{balance?.usedDays ?? '0'}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{balance?.entitledDays ?? '0'}</td>
                  <td className="py-2 text-xs text-gray-600 dark:text-gray-400">
                    {balance ? 'Provisioned' : 'Not provisioned'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No leave balances for this year. HR may need to provision balances.
      </p>
    )}
  </Card>
);

export default LeaveBalancesCard;
