import { describe, expect, it } from 'vitest';

import { parseWorkflowDomain, workflowTypesForDomain } from './workflowSetup';

describe('workflow domains', () => {
  it('uses Leave only for the missing domain, and rejects ambiguous or unsupported values', () => {
    expect(parseWorkflowDomain(new URLSearchParams())).toBe('leave');
    for (const query of [
      'domain=',
      'domain=Leave',
      'domain=payroll',
      'domain=leave&domain=expenses',
    ]) {
      expect(parseWorkflowDomain(new URLSearchParams(query))).toBeNull();
    }
  });
  it('maps each function to exactly its supported workflow entity types', () => {
    expect(workflowTypesForDomain('leave').map((type) => type.value)).toEqual(['LEAVE_REQUEST']);
    expect(workflowTypesForDomain('timesheets').map((type) => type.value)).toEqual([
      'TIMESHEET_WEEK_BATCH',
    ]);
    expect(workflowTypesForDomain('expenses').map((type) => type.value)).toEqual([
      'EXPENSE',
      'TRAVEL_REQUEST',
    ]);
  });
});
