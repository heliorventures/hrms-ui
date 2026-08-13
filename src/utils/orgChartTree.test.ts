import { describe, expect, it } from 'vitest';

import { analyzeOrgChart, filterOrgChartRows, findOrgChartRoots, type OrgChartRowLite } from './orgChartTree';

const row = (employeeId: string, reportingManagerId?: string): OrgChartRowLite => ({
  employeeId,
  employeeCode: employeeId,
  fullName: employeeId,
  reportingManagerId,
  departmentName: null,
  designationTitle: null,
});

describe('org chart operational safeguards', () => {
  it('reports missing managers and cycles without losing employees', () => {
    const rows = [row('A', 'B'), row('B', 'A'), row('C', 'missing')];
    const health = analyzeOrgChart(rows);
    expect(health.missingManagerEmployeeIds).toEqual(['C']);
    expect(health.cycleEmployeeIds).toEqual(['A', 'B']);
    expect(findOrgChartRoots(rows).length).toBeGreaterThan(0);
  });

  it('keeps ancestors when searching for a descendant', () => {
    const rows = [row('CEO'), row('MGR', 'CEO'), row('EMP', 'MGR')];
    rows[2] = { ...rows[2], fullName: 'Target Person' };
    expect(filterOrgChartRows(rows, 'target').map((item) => item.employeeId)).toEqual([
      'CEO',
      'MGR',
      'EMP',
    ]);
  });
});
