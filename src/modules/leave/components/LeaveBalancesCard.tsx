import type { LeaveBoardQuery } from '../../../api/graphql/graphql';
import Card from '../../../components/common/Card';
import type { ImportedLeaveHistory } from '../importedLeaveTypes';

import LeaveBalanceRow from './LeaveBalanceRow';

interface LeaveBalancesCardProps {
  importedHistory?: ImportedLeaveHistory | null;
  balanceYear: number;
  balances: LeaveBoardQuery['leaveBalances'];
  leaveTypes: LeaveBoardQuery['leaveTypes'];
  leaveTypeNameById: Map<string, string>;
  loading: boolean;
  yearChoices: number[];
  onYearChange: (year: number) => void;
}

const LeaveBalancesCard = ({
  importedHistory,
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
        <span>Leave Balances ({balanceYear})</span>
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
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading Balances...</p>
    ) : (
      <>
        {leaveTypes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
                  <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                    Available
                  </th>
                  <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                    Pending
                  </th>
                  <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Used</th>
                  <th className="py-2 font-medium text-gray-700 dark:text-gray-300">Entitled</th>
                </tr>
              </thead>
              <tbody>
                {leaveTypes.map((leaveType) => (
                  <LeaveBalanceRow
                    key={leaveType.id}
                    leaveType={leaveType}
                    balance={balances.find((row) => row.leaveTypeId === leaveType.id)}
                    imported={
                      importedHistory?.leave_type_id === leaveType.id ? importedHistory : null
                    }
                    name={leaveTypeNameById.get(leaveType.id) ?? leaveType.name}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {leaveTypes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No Leave Balances For This Year. HR May Need To Provision Balances.
          </p>
        )}
      </>
    )}
  </Card>
);

export default LeaveBalancesCard;
