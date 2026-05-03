import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { ClientOpsLeaveTypeNamesDocument, LeaveBalancesDocument } from '../../../api/graphql/graphql';

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

const LeaveBalanceCard = () => {
  const client = useGraphClient('client');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [typeMap, setTypeMap] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const ty = await client.request<{ leaveTypes: TypeRow[] }>(ClientOpsLeaveTypeNamesDocument, {
          limit: 50,
        });
        if (!c) {
          setTypeMap(Object.fromEntries(ty.leaveTypes.map((t) => [t.id, t.name])));
        }
        const res = await client.request<{ leaveBalances: Row[] }>(LeaveBalancesDocument, {
          limit: 20,
          year: new Date().getFullYear(),
        });
        if (!c) setRows(res.leaveBalances);
      } catch (e) {
        if (!c) {
          setError(
            e instanceof Error
              ? e.message
              : 'Sign in with an employee-linked account to see balances'
          );
        }
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [client]);

  return (
    <Link
      to="/leave#leave-requests"
      className="block rounded-xl outline-none ring-offset-2 ring-offset-slate-50 transition hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 dark:ring-offset-slate-950"
    >
      <Card title="Leave balance">
      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>}
      {error && !loading && <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>}
      {!loading && !error && rows && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 p-2 text-sm dark:border-gray-700"
            >
              <span className="text-gray-600 dark:text-gray-300">
                {typeMap[r.leaveTypeId] ?? r.leaveTypeId}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{r.balanceDays} left</Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  used {r.usedDays} · pending {r.pendingDays}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && rows && rows.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No leave balance rows yet.</p>
      )}
      <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">
        Open leave center →
      </p>
    </Card>
    </Link>
  );
};

export default LeaveBalanceCard;
