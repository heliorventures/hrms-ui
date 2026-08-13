import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  OrganizationDirectoryChartDocument,
  type OrganizationDirectoryChartQuery,
} from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  buildOrgChartChildMap,
  analyzeOrgChart,
  filterOrgChartRows,
  findOrgChartRoots,
  type OrgChartRowLite,
} from '../../utils/orgChartTree';

function EmployeeNodeCard({ row, childCount, collapsed, onToggle }: { row: OrgChartRowLite; childCount: number; collapsed: boolean; onToggle: () => void }) {
  const meta = [row.designationTitle, row.departmentName].filter(Boolean).join(' · ');
  return (
    <div className="relative z-[1] min-w-[10.5rem] max-w-[13rem] rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm dark:border-slate-600 dark:bg-slate-800">
      <Link
        to={`/organization/employees/${row.employeeId}`}
        className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400"
      >
        {row.fullName}
      </Link>
      <div className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
        {row.employeeCode}
      </div>
      {meta ? (
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-600 dark:text-slate-300">
          {meta}
        </p>
      ) : null}
      {childCount > 0 ? (
        <button type="button" onClick={onToggle} className="mx-auto mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" aria-expanded={!collapsed}>
          {collapsed ? <ChevronRight className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />}
          {childCount} direct {childCount === 1 ? 'report' : 'reports'}
        </button>
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
  ancestors = new Set<string>(),
  collapsedIds,
  onToggle,
}: {
  row: OrgChartRowLite;
  childMap: Map<string, OrgChartRowLite[]>;
  ancestors?: ReadonlySet<string>;
  collapsedIds: ReadonlySet<string>;
  onToggle: (employeeId: string) => void;
}) {
  if (ancestors.has(row.employeeId)) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        Reporting cycle detected at {row.fullName}; this branch was stopped.
      </div>
    );
  }
  const nextAncestors = new Set(ancestors);
  nextAncestors.add(row.employeeId);
  const kids = childMap.get(row.employeeId) ?? [];
  const collapsed = collapsedIds.has(row.employeeId);
  if (kids.length === 0) {
    return <EmployeeNodeCard row={row} childCount={0} collapsed={false} onToggle={() => undefined} />;
  }

  return (
    <div className="flex flex-col items-center">
      <EmployeeNodeCard row={row} childCount={kids.length} collapsed={collapsed} onToggle={() => onToggle(row.employeeId)} />
      {collapsed ? null : (
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
              <div
                className="mb-0 h-5 w-px shrink-0 bg-slate-400 md:hidden dark:bg-slate-500"
                aria-hidden
              />
              <div
                className="hidden h-5 w-px shrink-0 bg-slate-400 md:block dark:bg-slate-500"
                aria-hidden
              />
              <OrgSubtree row={child} childMap={childMap} ancestors={nextAncestors} collapsedIds={collapsedIds} onToggle={onToggle} />
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

const OrgChartPage = () => {
  const client = useGraphClient('client');
  const [rows, setRows] = useState<OrgChartRowLite[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.request<OrganizationDirectoryChartQuery>(
          OrganizationDirectoryChartDocument
        );
        if (!cancelled) {
          const nextRows = (res.organizationDirectoryChart ?? []) as OrgChartRowLite[];
          setRows(nextRows);
          if (nextRows.length > 150) {
            setCollapsedIds(new Set(nextRows.filter((row) => row.reportingManagerId).map((row) => row.employeeId)));
          }
        }
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

  const visibleRows = useMemo(() => (rows ? filterOrgChartRows(rows, search) : []), [rows, search]);
  const childMap = useMemo(() => (visibleRows.length ? buildOrgChartChildMap(visibleRows) : new Map()), [visibleRows]);

  const roots = useMemo(() => (visibleRows.length ? findOrgChartRoots(visibleRows) : []), [visibleRows]);
  const health = useMemo(() => analyzeOrgChart(rows ?? []), [rows]);
  const managerIds = useMemo(() => new Set((rows ?? []).filter((row) => (childMap.get(row.employeeId)?.length ?? 0) > 0).map((row) => row.employeeId)), [rows, childMap]);
  const toggleNode = (employeeId: string) => setCollapsedIds((current) => {
    const next = new Set(current);
    if (next.has(employeeId)) next.delete(employeeId); else next.add(employeeId);
    return next;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Org Chart</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Reporting hierarchy from <span className="font-mono text-xs">reportingManagerId</span>,
          shown as a top-down tree for all current employees in your organization.
        </p>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="w-full max-w-md">
            <Input label="Find employee" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, code, department, or designation" fullWidth />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setCollapsedIds(new Set())}>Expand all</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setCollapsedIds(new Set(managerIds))}>Collapse all</Button>
            <Button type="button" size="sm" variant="outline" aria-label="Zoom out" disabled={zoom <= 0.6} onClick={() => setZoom((value) => Math.max(0.6, value - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
            <span className="self-center text-xs tabular-nums text-slate-500">{Math.round(zoom * 100)}%</span>
            <Button type="button" size="sm" variant="outline" aria-label="Zoom in" disabled={zoom >= 1.4} onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
          </div>
        </div>
        {health.missingManagerEmployeeIds.length > 0 || health.cycleEmployeeIds.length > 0 ? (
          <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            Reporting data needs HR attention: {health.missingManagerEmployeeIds.length} missing manager reference(s) and {health.cycleEmployeeIds.length} employee(s) in reporting cycles.
          </div>
        ) : null}
        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Org Chart...</p>
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && roots.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No current employees or reporting relationships were returned.
          </p>
        )}
        {!loading && !error && roots.length > 0 && (
          <div className="overflow-auto rounded-xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="flex min-w-max origin-top flex-row items-start justify-center gap-16 pb-4 transition-transform" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              {roots.map((r) => (
                <OrgSubtree key={r.employeeId} row={r} childMap={childMap} collapsedIds={search ? new Set() : collapsedIds} onToggle={toggleNode} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrgChartPage;
