import { describe, expect, it } from 'vitest';
import { workflowType, approverLabel, WORKFLOW_TYPES } from './workflowSetup';

describe('workflow setup choices', () => {
  it('maps HR choices to the exact runtime entity and permission', () => {
    expect(WORKFLOW_TYPES.map((type) => type.label)).toEqual([
      'Leave',
      'Expenses',
      'Travel',
      'Timesheets',
    ]);
    expect(workflowType('EXPENSE')?.permission).toBe('expense:approve');
    expect(workflowType('TRAVEL_REQUEST')?.permission).toBe('travel:approve');
    expect(workflowType('LEAVE_REQUEST')?.permission).toBe('leave:approve');
    expect(workflowType('TIMESHEET_WEEK_BATCH')?.permission).toBe('timesheet:approve');
    expect(workflowType('typo')).toBeUndefined();
  });
  it('explains approvers without exposing runtime codes', () => {
    expect(approverLabel('MANAGER')).toBe('Reporting manager');
    expect(approverLabel('PERMISSION')).toBe('Any eligible approver');
  });
});
