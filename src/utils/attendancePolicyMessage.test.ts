import { describe, expect, it } from 'vitest';

import { attendancePolicyMessage } from './attendancePolicyMessage';

describe('attendancePolicyMessage', () => {
  it('explains the employee self-service window without technical language', () => {
    expect(attendancePolicyMessage(14, false)).toEqual({
      employee:
        'You can add missed punches from the last 14 calendar days. For an earlier date, ask HR or your manager to adjust your attendance.',
    });
  });

  it('explains the additional regularization capability when available', () => {
    expect(attendancePolicyMessage(7, true)).toEqual({
      employee:
        'You can add missed punches from the last 7 calendar days. For an earlier date, ask HR or your manager to adjust your attendance.',
      regularizer:
        'You can also adjust earlier dates because your role includes attendance regularization.',
    });
  });

  it('uses the safe 14-day default for invalid policy values', () => {
    expect(attendancePolicyMessage(-1, false).employee).toContain('last 14 calendar days');
    expect(attendancePolicyMessage(Number.NaN, false).employee).toContain('last 14 calendar days');
  });
});
