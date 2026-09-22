export type PerformanceTestState = {
  request: {
    mockImplementation: (implementation: (document: unknown) => unknown) => void;
    mockClear: () => void;
    mock: { calls: Array<[unknown]> };
  };
  permissions: Set<string>;
  permissionScopes: Record<string, string>;
};

export const resetPerformanceState = (state: PerformanceTestState) => {
  state.permissions = new Set(['performance:self', 'performance:manage']);
  state.permissionScopes = { 'performance:self': 'SELF', 'performance:manage': 'ALL' };
  state.request.mockImplementation((document: unknown) => {
    const source = String(document);
    if (source.includes('MyPerformanceReviewsWorkspace'))
      return Promise.resolve({ myPerformanceReviews: [] });
    if (source.includes('TeamPerformanceReviewsWorkspace'))
      return Promise.resolve({ myTeamPerformanceReviews: [] });
    if (source.includes('PerformanceProgramsWorkspace'))
      return Promise.resolve({
        performancePrograms: [{ id: 'p1', name: 'Annual', status: 'DRAFT' }],
      });
    if (source.includes('AppraisalTemplatesWorkspace'))
      return Promise.resolve({ appraisalTemplates: [] });
    if (source.includes('PerformanceGoalKpisWorkspace'))
      return Promise.resolve({ performanceGoalKpis: [] });
    return Promise.resolve({ reviewCycles: [], goals: [] });
  });
  state.request.mockClear();
};

export const acknowledgementReview = {
  id: 'ack-review',
  reviewCycleId: 'cycle-1',
  employeeId: 'me',
  employeeName: 'Employee',
  managerEmployeeId: 'manager-1',
  appraisalTemplateId: 'template-1',
  cycleName: 'Annual',
  cycleStartDate: '2026-01-01',
  cycleEndDate: '2026-12-31',
  cycleStage: 'EMPLOYEE_ACKNOWLEDGEMENT',
  status: 'PENDING',
  responseRevision: 1,
};

export const acknowledgementDetail = {
  review: acknowledgementReview,
  goals: [],
  feedback: [],
  answers: [],
  template: {
    id: 'template-1',
    performanceProgramId: 'program-1',
    version: 1,
    name: 'Annual',
    status: 'PUBLISHED',
    sections: [],
  },
};

export const goalApprovalScenarios: Array<{
  label: string;
  permissions: Set<string>;
  scopes: Record<string, string>;
  managerEmployeeId: string;
  expected: boolean;
}> = [
  {
    label: 'the assigned manager',
    permissions: new Set(['performance:evaluate']),
    scopes: { 'performance:evaluate': 'TEAM' },
    managerEmployeeId: 'me',
    expected: true,
  },
  {
    label: 'an unrelated manager',
    permissions: new Set(['performance:evaluate']),
    scopes: { 'performance:evaluate': 'TEAM' },
    managerEmployeeId: 'manager-2',
    expected: false,
  },
  {
    label: 'a manage-all actor',
    permissions: new Set(['performance:manage']),
    scopes: { 'performance:manage': 'ALL' },
    managerEmployeeId: 'manager-2',
    expected: true,
  },
];
