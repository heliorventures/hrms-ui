import { describe, expect, it } from 'vitest';

import { reviewValueRows } from './profileReviewValues';

describe('reviewValueRows', () => {
  it('pairs current and requested values without losing empty fields', () => {
    expect(
      reviewValueRows(
        { bank_name: 'Old Bank', account_number: null },
        { bank_name: 'New Bank', account_number: '12345678' }
      )
    ).toEqual([
      { key: 'account_number', current: 'Not set', requested: '12345678' },
      { key: 'bank_name', current: 'Old Bank', requested: 'New Bank' },
    ]);
  });
});
