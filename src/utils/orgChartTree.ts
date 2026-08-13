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
    list.sort((a, b) =>
      (a.employeeCode ?? '').localeCompare(b.employeeCode ?? '', undefined, { numeric: true })
    );
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
  const childMap = buildOrgChartChildMap(rows);
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    for (const child of childMap.get(id) ?? []) visit(child.employeeId);
  };
  for (const root of roots) visit(root.employeeId);

  // Corrupt legacy cycles have no natural root. Promote one node per disconnected
  // component so every employee remains visible; recursive rendering still guards cycles.
  for (const row of rows) {
    if (visited.has(row.employeeId)) continue;
    roots.push(row);
    visit(row.employeeId);
  }
  roots.sort((a, b) =>
    (a.employeeCode ?? '').localeCompare(b.employeeCode ?? '', undefined, { numeric: true })
  );
  return roots;
}

export interface OrgChartHealth {
  missingManagerEmployeeIds: string[];
  cycleEmployeeIds: string[];
}

export function analyzeOrgChart(rows: OrgChartRowLite[]): OrgChartHealth {
  const byId = new Map(rows.map((row) => [row.employeeId, row]));
  const missingManagerEmployeeIds = rows
    .filter((row) => {
      const managerId = row.reportingManagerId?.trim();
      return managerId != null && managerId !== '' && !byId.has(managerId);
    })
    .map((row) => row.employeeId)
    .sort();
  const cycleIds = new Set<string>();
  const state = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];
  const visit = (employeeId: string) => {
    if (state.get(employeeId) === 2) return;
    if (state.get(employeeId) === 1) {
      const start = stack.lastIndexOf(employeeId);
      for (const id of stack.slice(Math.max(0, start))) cycleIds.add(id);
      return;
    }
    state.set(employeeId, 1);
    stack.push(employeeId);
    const managerId = byId.get(employeeId)?.reportingManagerId?.trim();
    if (managerId && byId.has(managerId)) visit(managerId);
    stack.pop();
    state.set(employeeId, 2);
  };
  for (const row of rows) visit(row.employeeId);
  return {
    missingManagerEmployeeIds,
    cycleEmployeeIds: [...cycleIds].sort(),
  };
}

export function filterOrgChartRows(rows: OrgChartRowLite[], query: string): OrgChartRowLite[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;
  const byId = new Map(rows.map((row) => [row.employeeId, row]));
  const included = new Set<string>();
  for (const row of rows) {
    const searchable = [row.fullName, row.employeeCode, row.departmentName, row.designationTitle]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!searchable.includes(normalized)) continue;
    let current: OrgChartRowLite | undefined = row;
    const seen = new Set<string>();
    while (current && !seen.has(current.employeeId)) {
      seen.add(current.employeeId);
      included.add(current.employeeId);
      const managerId: string | undefined = current.reportingManagerId?.trim();
      current = managerId ? byId.get(managerId) : undefined;
    }
  }
  return rows.filter((row) => included.has(row.employeeId));
}
