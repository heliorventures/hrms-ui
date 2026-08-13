import { describe, expect, it } from 'vitest';

import { formatWorkDuration } from './workDuration';

describe('formatWorkDuration', () => {
  it('formats complete years and months from employment dates', () => {
    expect(formatWorkDuration('2020-01-15', '2022-04-14')).toBe('2 yrs 2 mos');
  });
});
