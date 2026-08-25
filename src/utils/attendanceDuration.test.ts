import { describe, expect, it } from 'vitest';

import { formatMinutesAsHhMm } from './attendanceDuration';

describe('formatMinutesAsHhMm', () => {
  it('rounds the total before splitting hours and minutes', () => {
    expect(formatMinutesAsHhMm(59 + 59 / 60)).toBe('1h 00m');
    expect(formatMinutesAsHhMm(59)).toBe('0h 59m');
    expect(formatMinutesAsHhMm(59.99)).not.toContain('60m');
  });
});
