import { expect, it } from 'vitest';

import { documentItems, requiredString, sourceVersion } from './organizationDocuments';

it('rejects unrecognized document versions and non-object records', () => {
  expect(() => documentItems(2, [])).toThrow('Unsupported organization data version');
  expect(() => documentItems(1, ['private string'])).toThrow('Invalid organization record');
  expect(documentItems(1, [{ id: 'a' }])).toEqual([{ id: 'a' }]);
});

it('requires authoritative resource identity and positive version without fabricated defaults', () => {
  expect(requiredString({ id: 'record-a' }, 'id')).toBe('record-a');
  expect(() => requiredString({}, 'id')).toThrow('Refresh organization data');
  expect(() => sourceVersion({ version: 0 })).toThrow('Refresh the source record');
  expect(() => sourceVersion({ version: null })).toThrow('Refresh the source record');
  expect(sourceVersion({ version: 13 })).toBe(13);
});
