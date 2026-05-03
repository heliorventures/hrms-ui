import type { OrgChartQuery } from '../api/graphql/graphql';

/** Flat row from `orgChart` — reporting links use `reportingManagerId`. */
export type OrgChartRowLite = NonNullable<OrgChartQuery['orgChart']>[number];

/** Children grouped by manager id (manager must exist in `rows` for a link to count). */
export function buildOrgChartChildMap(rows: OrgChartRowLite[]): Map<string, OrgChartRowLite[]> {
  const byId = new Map(rows.map((r) => [r.employeeId, r]));
  const childMap = new Map<string, OrgChartRowLite[]>();
  for (const r of rows) {
    const mid = r.reportingManagerId?.trim();
    if (!mid || !byId.has(mid)) continue;
    const list = childMap.get(mid) ?? [];
    list.push(r);
    childMap.set(mid, list);
  }
  for (const [, list] of childMap) {
    list.sort((a, b) => (a.employeeCode ?? '').localeCompare(b.employeeCode ?? '', undefined, { numeric: true }));
  }
  return childMap;
}

/** Top nodes: no manager or manager not in this dataset (orphan / external manager). */
export function findOrgChartRoots(rows: OrgChartRowLite[]): OrgChartRowLite[] {
  const byId = new Map(rows.map((r) => [r.employeeId, r]));
  const roots = rows.filter((r) => {
    const mid = r.reportingManagerId?.trim();
    return !mid || !byId.has(mid);
  });
  roots.sort((a, b) => (a.employeeCode ?? '').localeCompare(b.employeeCode ?? '', undefined, { numeric: true }));
  return roots;
}
