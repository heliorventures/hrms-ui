import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';
import { OrgChartDocument, type OrgChartQuery } from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  buildOrgChartChildMap,
  findOrgChartRoots,
  type OrgChartRowLite,
} from '../../utils/orgChartTree';

function EmployeeNodeCard({ row }: { row: OrgChartRowLite }) {
  const meta = [row.designationTitle, row.departmentName].filter(Boolean).join(' · ');
  return (
    <div className="relative z-[1] min-w-[10.5rem] max-w-[13rem] rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm dark:border-slate-600 dark:bg-slate-800">
      <Link
        to={`/organization/employees/${row.employeeId}`}
        className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400"
      >
        {row.fullName}
      </Link>
      <div className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">{row.employeeCode}</div>
      {meta ? (
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-600 dark:text-slate-300">{meta}</p>
      ) : null}
    </div>
  );
}

/**
 * Top-down tree: parent centered above a row of children with simple connector lines.
 */
function OrgSubtree({
  row,
  childMap,
}: {
  row: OrgChartRowLite;
  childMap: Map<string, OrgChartRowLite[]>;
}) {
  const kids = childMap.get(row.employeeId) ?? [];
  if (kids.length === 0) {
    return <EmployeeNodeCard row={row} />;
  }

  return (
    <div className="flex flex-col items-center">
      <EmployeeNodeCard row={row} />
      <div className="flex w-full flex-col items-center">
        <div className="h-5 w-px shrink-0 bg-slate-400 dark:bg-slate-500" aria-hidden />
        <div className="relative flex w-full flex-row flex-wrap items-start justify-center gap-x-10 gap-y-10 px-2 py-2 md:gap-x-14">
          {/* sibling connector rail */}
          {kids.length > 1 && (
            <div
              className="pointer-events-none absolute top-0 left-1/2 hidden h-px -translate-x-1/2 bg-slate-400 md:block dark:bg-slate-500"
              style={{
                width: `min(calc(100% - 4rem), ${(kids.length - 1) * 14}rem)`,
              }}
              aria-hidden
            />
          )}
          {kids.map((child) => (
            <div key={child.employeeId} className="relative flex flex-col items-center">
              <div className="mb-0 h-5 w-px shrink-0 bg-slate-400 md:hidden dark:bg-slate-500" aria-hidden />
              <div className="hidden h-5 w-px shrink-0 bg-slate-400 md:block dark:bg-slate-500" aria-hidden />
              <OrgSubtree row={child} childMap={childMap} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const OrgChartPage = () => {
  const client = useGraphClient('client');
  const [rows, setRows] = useState<OrgChartRowLite[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.request<OrgChartQuery>(OrgChartDocument, { limit: 500 });
        if (!cancelled) setRows((res.orgChart ?? []) as OrgChartRowLite[]);
      } catch (e) {
        if (!cancelled) {
          setError(graphQlUserMessage(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const childMap = useMemo(() => (rows?.length ? buildOrgChartChildMap(rows) : new Map()), [rows]);

  const roots = useMemo(() => (rows?.length ? findOrgChartRoots(rows) : []), [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Org chart</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Reporting hierarchy from <span className="font-mono text-xs">reportingManagerId</span>, shown as a top-down
          tree. Visibility follows your <span className="font-mono text-xs">employee</span> data scope (same as the
          directory).
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
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="flex min-w-max flex-row items-start justify-center gap-16 pb-4">
              {roots.map((r) => (
                <OrgSubtree key={r.employeeId} row={r} childMap={childMap} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrgChartPage;
