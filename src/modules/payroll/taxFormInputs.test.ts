import { expect, it } from 'vitest';

import { taxHistoryInput, taxSettingsInput } from './taxFormInputs';
import { parseComponentAmounts, percentageFraction } from './taxFormValues';

const history = {
  year: 2026,
  from: '2026-05-01',
  until: '2026-08-31',
  source: 'HR-OPENING',
  employer: 'CURRENT',
  components: 'BASIC=25000.25\nHRA=10000.50',
  tds: '',
  complete: false,
  reason: 'HR supplied opening earnings',
};
it('keeps missing TDS distinct from HR-confirmed zero and uses exact amounts', () => {
  expect(taxHistoryInput(history)).toMatchObject({
    tds: null,
    earnings: '35000.75',
    coverage: 'INCOMPLETE',
  });
  expect(taxHistoryInput({ ...history, complete: true, tds: '0' })).toMatchObject({
    tds: '0',
    coverage: 'COMPLETE',
  });
  expect(() => taxHistoryInput({ ...history, complete: true })).toThrow(/requires recorded TDS/);
  expect(() => taxHistoryInput({ ...history, tds: '-10' })).toThrow(/non-negative/);
});
it('does not extend a May join tax year into the following April', () => {
  expect(() => taxHistoryInput({ ...history, until: '2027-04-30' })).toThrow(/April–March/);
  expect(() => taxHistoryInput({ ...history, from: '2026-03-31' })).toThrow(/April–March/);
});
it('converts configurable percentage without floating point drift and requires a basis and reason', () => {
  expect(percentageFraction('10')).toBe('0.100000');
  expect(percentageFraction('0.7501')).toBe('0.007501');
  const fields = {
    regime: 'NEW',
    method: 'PERCENTAGE_OVERRIDE' as const,
    rate: '10',
    basis: 'BASIC,HRA',
    from: '2026-10-01',
    until: '',
    resident: 'true',
    reason: 'Client instructed withholding',
  };
  expect(taxSettingsInput(fields)).toMatchObject({
    percentage: '0.100000',
    basis_components: ['BASIC', 'HRA'],
  });
  expect(() => taxSettingsInput({ ...fields, reason: '' })).toThrow(/reason/);
  expect(() => taxSettingsInput({ ...fields, regime: '' })).toThrow(/regime/);
});
it('rejects incomplete and duplicate component entries', () => {
  for (const text of ['BASIC', 'BASIC=1=2', 'BASIC=1\nBASIC=2'])
    expect(() => parseComponentAmounts(text)).toThrow();
});
