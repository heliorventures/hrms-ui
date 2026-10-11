import { describe, expect, it, vi } from 'vitest';

import { allLoanPages } from './loanPagination';

describe('Complete financial catalogues and statements', () => {
  it('loads every page before returning any complete result', async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce({ nodes: ['first'], pageInfo: { hasNextPage: true, endCursor: 'a' } })
      .mockResolvedValueOnce({ nodes: ['second'], pageInfo: { hasNextPage: false } });
    await expect(allLoanPages(load)).resolves.toEqual(['first', 'second']);
    expect(load.mock.calls).toEqual([[null], ['a']]);
  });
  it('rejects a partial result when a later page fails', async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce({ nodes: ['first'], pageInfo: { hasNextPage: true, endCursor: 'a' } })
      .mockRejectedValueOnce(new Error('Account version changed'));
    await expect(allLoanPages(load)).rejects.toThrow('Account version changed');
  });
  it.each([null, 'a'])('rejects a missing or repeated continuation cursor (%s)', async (cursor) => {
    const load = vi
      .fn()
      .mockResolvedValueOnce({ nodes: [], pageInfo: { hasNextPage: true, endCursor: 'a' } })
      .mockResolvedValueOnce({ nodes: [], pageInfo: { hasNextPage: true, endCursor: cursor } });
    await expect(allLoanPages(load)).rejects.toThrow('could not be loaded completely');
  });
});
