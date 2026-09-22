import type { PerformanceProgramPolicyRow } from '../performanceAdminQueries';

export const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

export const modes = [
  { value: 'ALL', label: 'All eligible employees' },
  { value: 'DEPARTMENTS', label: 'Selected departments' },
  { value: 'LOCATIONS', label: 'Selected locations' },
  { value: 'EMPLOYEES', label: 'Selected employees' },
] as const;

export const deadlineFields: Array<{
  key: keyof Pick<
    PerformanceProgramPolicyRow,
    | 'goalSettingDueDays'
    | 'selfReviewDueDays'
    | 'managerReviewDueDays'
    | 'calibrationDueDays'
    | 'acknowledgementDueDays'
  >;
  label: string;
}> = [
  { key: 'goalSettingDueDays', label: 'Goal setting' },
  { key: 'selfReviewDueDays', label: 'Self review' },
  { key: 'managerReviewDueDays', label: 'Manager review' },
  { key: 'calibrationDueDays', label: 'Calibration' },
  { key: 'acknowledgementDueDays', label: 'Acknowledgement' },
];

export type PolicyDraft = Omit<PerformanceProgramPolicyRow, 'archivedAt' | 'performanceProgramId'>;
export type DeadlineKey = (typeof deadlineFields)[number]['key'];

export const emptyDraft: PolicyDraft = {
  populationMode: 'ALL',
  populationIds: [],
  goalSettingDueDays: null,
  selfReviewDueDays: null,
  managerReviewDueDays: null,
  calibrationDueDays: null,
  acknowledgementDueDays: null,
};

export const toDraft = (policy: PerformanceProgramPolicyRow): PolicyDraft => ({
  populationMode: policy.populationMode,
  populationIds: policy.populationIds,
  goalSettingDueDays: policy.goalSettingDueDays ?? null,
  selfReviewDueDays: policy.selfReviewDueDays ?? null,
  managerReviewDueDays: policy.managerReviewDueDays ?? null,
  calibrationDueDays: policy.calibrationDueDays ?? null,
  acknowledgementDueDays: policy.acknowledgementDueDays ?? null,
});

export const invalidDeadlines = (draft: PolicyDraft): string | null => {
  let previous: number | null = null;
  for (const { key, label } of deadlineFields) {
    const value = draft[key];
    if (value === null || value === undefined) continue;
    if (!Number.isInteger(value) || value < 0) return `${label} must be a whole number of days.`;
    if (previous !== null && value <= previous) {
      return `${label} must be after the prior configured stage.`;
    }
    previous = value;
  }
  return null;
};
