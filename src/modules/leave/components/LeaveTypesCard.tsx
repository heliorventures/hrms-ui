import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import type { LeaveBoardQuery } from '../../../api/graphql/graphql';

interface LeaveTypesCardProps {
  leaveTypes: LeaveBoardQuery['leaveTypes'];
  loading: boolean;
}

const LeaveTypesCard = ({ leaveTypes, loading }: LeaveTypesCardProps) => (
  <Card title="Leave Types">
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading leave types...</p>
    ) : leaveTypes.length ? (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {leaveTypes.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {item.code}
                </p>
              </div>
              <Badge variant={item.isPaid ? 'success' : 'neutral'}>
                {item.isPaid ? 'Paid' : 'Unpaid'}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge variant={item.carryForward ? 'info' : 'neutral'}>
                {item.carryForward ? 'Carry forward' : 'No carry forward'}
              </Badge>
              <Badge variant={item.requiresDocument ? 'warning' : 'neutral'}>
                {item.requiresDocument ? 'Document required' : 'No document'}
              </Badge>
              <Badge variant={item.halfDayAllowed ? 'info' : 'neutral'}>
                {item.halfDayAllowed ? 'Half-day allowed' : 'Full days only'}
              </Badge>
              {item.sandwichRule ? <Badge variant="warning">Sandwich rule</Badge> : null}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">No leave types found.</p>
    )}
  </Card>
);

export default LeaveTypesCard;
