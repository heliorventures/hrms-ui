import type { LeaveBoardQuery } from '../../../api/graphql/graphql';
import type { ImportedLeaveHistory } from '../importedLeaveTypes';

interface Props {
  leaveType: LeaveBoardQuery['leaveTypes'][number];
  balance?: LeaveBoardQuery['leaveBalances'][number];
  imported?: ImportedLeaveHistory | null;
  name: string;
}

const allocation = (value: string | undefined, imported?: ImportedLeaveHistory | null) => {
  if (imported && !imported.ready) return 'Awaiting review';
  return value ?? 'Awaiting allocation';
};

const LeaveBalanceRow = ({ leaveType, balance, imported, name }: Props) => {
  const available = leaveType.isPaid ? allocation(balance?.balanceDays, imported) : 'No quota';
  const entitled = leaveType.isPaid
    ? allocation(balance?.entitledDays, imported)
    : 'Approval required';
  const pending =
    imported?.opening.pending === null
      ? `${balance?.pendingDays ?? '0'} new; opening not supplied`
      : (balance?.pendingDays ?? 'Not supplied');
  const used = balance?.usedDays ?? 'See history and requests';
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <td className="py-2 pr-4 text-gray-900 dark:text-white">{name}</td>
      <td className="py-2 pr-4 font-mono text-xs">{available}</td>
      <td className="py-2 pr-4 font-mono text-xs">{pending}</td>
      <td className="py-2 pr-4 font-mono text-xs">{used}</td>
      <td className="py-2 font-mono text-xs">{entitled}</td>
    </tr>
  );
};

export default LeaveBalanceRow;
