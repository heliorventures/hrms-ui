import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import {
  ClientOpsLeaveTypeNamesDocument,
  LeaveBalancesDocument,
} from '../../../api/graphql/graphql';
import { authorizationStateKey, createPermissionService } from '../../../auth/permissionService';
import AsyncState from '../../../components/common/AsyncState';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery, type RetainedQueryPhase } from '../../../hooks/useRetainedQuery';

import { DashboardCardInitialState, DashboardCardRefreshNotice } from './DashboardCardQueryState';
import { formatLeaveDays } from './leaveBalanceFormat';
import LeaveBalanceMeter from './LeaveBalanceMeter';

interface TypeRow {
  id: string;
  name: string;
  code: string;
}

interface Row {
  id: string;
  leaveTypeId: string;
  year: number;
  balanceDays: string;
  entitledDays: string;
  pendingDays: string;
  usedDays: string;
}

interface LeaveBalanceResult {
  rows: Row[];
  typeMap: Record<string, string>;
  leaveTypeCount: number;
}

const BALANCE_LIMIT = 20;
const LEAVE_TYPE_LIMIT = 50;

interface LeaveBalanceFooterProps {
  hasData: boolean;
  onRefresh: () => void;
  phase: RetainedQueryPhase;
}

const LeaveBalanceFooter = ({ hasData, onRefresh, phase }: LeaveBalanceFooterProps) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
    {hasData ? (
      <Button
        variant="quiet"
        size="sm"
        busy={phase === 'refreshing'}
        busyLabel="Refreshing Leave Balances…"
        onClick={onRefresh}
      >
        Refresh Leave Balances
      </Button>
    ) : null}
    <Link
      to="/leave#leave-requests"
      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
    >
      Open Leave Center →
    </Link>
  </div>
);

interface LeaveBalanceListProps {
  rows: Row[];
  typeMap: Record<string, string>;
}

const LeaveBalanceList = ({ rows, typeMap }: LeaveBalanceListProps) => {
  if (rows.length === 0) {
    return (
      <AsyncState
        kind="empty"
        title="No Leave Balances Yet."
        description="Your available leave will appear here after balances are assigned."
      />
    );
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-x-3 gap-y-5">
      {rows.map((row) => {
        const name = typeMap[row.leaveTypeId] ?? 'Leave';
        return (
          <li key={row.id} className="min-w-0 text-center">
            <LeaveBalanceMeter
              name={name}
              balanceDays={row.balanceDays}
              entitledDays={row.entitledDays}
            />
            <p className="mt-2 min-w-0 break-words text-sm font-medium text-content-primary">
              {name}
            </p>
            <p className="mt-1 text-xs tabular-nums text-content-secondary">
              Used {formatLeaveDays(row.usedDays)}
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-content-secondary">
              Pending {formatLeaveDays(row.pendingDays)}
            </p>
          </li>
        );
      })}
    </ul>
  );
};

const AuthorizedLeaveBalanceCard = () => {
  const client = useGraphClient('client');
  const loadBalances = useCallback(async (): Promise<LeaveBalanceResult> => {
    const [typesResult, balancesResult] = await Promise.all([
      client.request<{ leaveTypes: TypeRow[] }>(ClientOpsLeaveTypeNamesDocument, {
        limit: LEAVE_TYPE_LIMIT,
      }),
      client.request<{ leaveBalances: Row[] }>(LeaveBalancesDocument, {
        limit: BALANCE_LIMIT,
        year: new Date().getFullYear(),
      }),
    ]);

    return {
      rows: balancesResult.leaveBalances,
      typeMap: Object.fromEntries(typesResult.leaveTypes.map((type) => [type.id, type.name])),
      leaveTypeCount: typesResult.leaveTypes.length,
    };
  }, [client]);

  const { data, error, phase, refresh } = useRetainedQuery(loadBalances);
  const rows = data?.rows ?? [];
  const typeMap = data?.typeMap ?? {};
  const onRefresh = () => void refresh();

  if (phase === 'initial-loading' || phase === 'initial-error') {
    return (
      <Card title="Leave Balance">
        <DashboardCardInitialState
          phase={phase}
          loadingTitle="Loading Leave Balances…"
          errorTitle="Leave Balances Could Not Be Loaded"
          error={error}
          onRetry={onRefresh}
        />
        <LeaveBalanceFooter hasData={false} phase={phase} onRefresh={onRefresh} />
      </Card>
    );
  }

  return (
    <Card title="Leave Balance">
      <DashboardCardRefreshNotice
        phase={phase}
        loadingTitle="Refreshing Leave Balances…"
        loadingDescription="Showing the last loaded balances while this updates."
        staleTitle="Leave Balances May Be Out of Date"
        staleDescription="Showing the last loaded balances."
        error={error}
        onRetry={onRefresh}
      />
      <LeaveBalanceList rows={rows} typeMap={typeMap} />
      {rows.length === BALANCE_LIMIT ? (
        <p role="status" className="mt-3 text-xs text-content-secondary">
          Showing up to {BALANCE_LIMIT} leave balances. More may be available.
        </p>
      ) : null}
      {data?.leaveTypeCount === LEAVE_TYPE_LIMIT ? (
        <p role="status" className="mt-2 text-xs text-content-secondary">
          Showing up to {LEAVE_TYPE_LIMIT} leave types. More may be available.
        </p>
      ) : null}
      <LeaveBalanceFooter hasData phase={phase} onRefresh={onRefresh} />
    </Card>
  );
};

const LeaveBalanceCard = () => {
  const { clientSession } = useAuth();
  if (!createPermissionService(clientSession).canCapability('dashboard.leave')) return null;
  return <AuthorizedLeaveBalanceCard key={authorizationStateKey(clientSession)} />;
};

export default LeaveBalanceCard;
