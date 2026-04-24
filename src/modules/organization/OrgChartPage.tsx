import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { gql } from 'graphql-request';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';

export interface OrgChartRow {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  reportingManagerId: string | null;
  departmentName: string | null;
  designationTitle: string | null;
}

interface OrgChartData {
  orgChart: OrgChartRow[];
}

const ORG_CHART_Q = gql`
  query OrgChart($limit: Int! = 500) {
    orgChart(limit: $limit) {
      employeeId
      employeeCode
      fullName
      reportingManagerId
      departmentName
      designationTitle
    }
  }
`;

interface TreeProps {
  row: OrgChartRow;
  childrenByManager: Map<string, OrgChartRow[]>;
  depth: number;
}

const TreeBranch = ({ row, childrenByManager, depth }: TreeProps) => {
  const kids = childrenByManager.get(row.employeeId) ?? [];
  const pad = Math.min(depth * 1.25, 20);
  return (
    <li className="list-none">
      <div
        style={{ marginLeft: `${pad}rem` }}
        className="mb-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/80"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <Link
              to={`/organization/employees/${row.employeeId}`}
              className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
            >
              {row.fullName}
            </Link>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {row.employeeCode}
            </span>
          </div>
        </div>
        {(row.designationTitle || row.departmentName) && (
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            {[row.designationTitle, row.departmentName].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      {kids.length > 0 && (
        <ul className="space-y-0 border-l border-gray-200 pl-2 dark:border-gray-600">
          {kids.map((c) => (
            <TreeBranch
              key={c.employeeId}
              row={c}
              childrenByManager={childrenByManager}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const OrgChartPage = () => {
  const client = useGraphClient('client');
  const [rows, setRows] = useState<OrgChartRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.request<OrgChartData>(ORG_CHART_Q, { limit: 500 });
        if (!cancelled) setRows(res.orgChart);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load org chart');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const { roots, childrenByManager } = useMemo(() => {
    if (!rows?.length) {
      return { roots: [] as OrgChartRow[], childrenByManager: new Map<string, OrgChartRow[]>() };
    }
    const byId = new Map(rows.map((r) => [r.employeeId, r]));
    const childMap = new Map<string, OrgChartRow[]>();
    for (const r of rows) {
      const mid = r.reportingManagerId;
      if (mid && byId.has(mid)) {
        const list = childMap.get(mid) ?? [];
        list.push(r);
        childMap.set(mid, list);
      }
    }
    for (const [, list] of childMap) {
      list.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
    }
    const rootList = rows.filter((r) => {
      if (!r.reportingManagerId) return true;
      return !byId.has(r.reportingManagerId);
    });
    rootList.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
    return { roots: rootList, childrenByManager: childMap };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Org chart</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Read-only reporting hierarchy from <span className="font-mono text-xs">reportingManagerId</span>.
          Visibility follows your <span className="font-mono text-xs">employee</span> data scope (same as the
          employee directory).
        </p>
      </div>

      <Card>
        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading org chart…</p>
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && roots.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No employees in scope, or no rows returned.
          </p>
        )}
        {!loading && !error && roots.length > 0 && (
          <ul className="space-y-1">
            {roots.map((r) => (
              <TreeBranch
                key={r.employeeId}
                row={r}
                childrenByManager={childrenByManager}
                depth={0}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default OrgChartPage;
