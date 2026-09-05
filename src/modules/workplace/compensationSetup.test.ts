import { describe, expect, it } from 'vitest';

import { validateCompensationSetup } from './compensationSetup';

describe('compensation setup validation', () => {
  it('rejects reversed dates', () =>
    expect(
      validateCompensationSetup('cycle', {
        name: 'Annual',
        year: '2026',
        startDate: '2026-12-01',
        endDate: '2026-01-01',
        budgetPercentage: '',
      })
    ).toBeTruthy());
  it('rejects salary inversion and nonfinite amounts', () => {
    expect(
      validateCompensationSetup('band', {
        designationId: 'a',
        minSalary: '20',
        midSalary: '10',
        maxSalary: '30',
        currency: 'INR',
      })
    ).toBeTruthy();
    expect(
      validateCompensationSetup('band', {
        designationId: 'a',
        minSalary: 'Infinity',
        currency: 'INR',
      })
    ).toBeTruthy();
  });
  it('accepts zero and ordered decimal salary values', () =>
    expect(
      validateCompensationSetup('band', {
        designationId: 'a',
        minSalary: '0',
        midSalary: '10.25',
        maxSalary: '20',
        currency: 'INR',
      })
    ).toBeNull());
});
