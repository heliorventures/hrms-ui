import { describe, expect, it } from 'vitest';
import { validateJobPosting } from './recruitmentSetup';
describe('job posting validation', () => {
  it('rejects blank titles, fractional vacancies, and reversed dates', () => {
    expect(
      validateJobPosting({ title: ' ', vacancies: 1, openDate: '', closeDate: '' })
    ).toBeTruthy();
    expect(
      validateJobPosting({ title: 'Engineer', vacancies: 1.5, openDate: '', closeDate: '' })
    ).toBeTruthy();
    expect(
      validateJobPosting({
        title: 'Engineer',
        vacancies: 1,
        openDate: '2026-09-10',
        closeDate: '2026-09-01',
      })
    ).toBeTruthy();
  });
  it('accepts a valid posting', () =>
    expect(
      validateJobPosting({ title: 'Engineer', vacancies: 2, openDate: '', closeDate: '' })
    ).toBeNull());
});
