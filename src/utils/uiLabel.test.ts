import { describe, expect, it } from 'vitest';
import { titleCaseLabel } from './uiLabel';

describe('titleCaseLabel', () => {
  it('normalizes report labels without changing acronyms inside words', () => {
    expect(titleCaseLabel('ALL employees')).toBe('All Employees');
    expect(titleCaseLabel('pending approval')).toBe('Pending Approval');
  });
});
