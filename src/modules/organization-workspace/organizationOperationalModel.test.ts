import { expect, it } from 'vitest';

import {
  exactLeaveDays,
  operationalCompanies,
  operationalRows,
} from './organizationOperationalModel';

it('retains exact leave hundredths beyond number precision and represents missing data explicitly', () => {
  expect(exactLeaveDays('125')).toBe('1.25');
  expect(exactLeaveDays('900719925474099301')).toBe('9007199254740993.01');
  expect(exactLeaveDays('0')).toBe('0.00');
  expect(exactLeaveDays(125)).toBe('Unavailable');
  expect(operationalRows(null)).toBeNull();
  expect(operationalRows([])).toEqual([]);
  expect(() => operationalRows(undefined)).toThrow('unavailable');
});

it('rejects incompatible report versions and malformed company/category records', () => {
  expect(() => operationalCompanies({ schema_version: 2, companies: [] })).toThrow('version');
  expect(() => operationalCompanies({ schema_version: 1, companies: [null] })).toThrow('Invalid');
  expect(() => operationalRows([null])).toThrow('Invalid');
});
