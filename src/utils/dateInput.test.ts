import { describe, expect, it } from 'vitest';

import { toDateInputValue } from './dateInput';

describe('toDateInputValue', () => {
  it('uses local calendar parts instead of UTC serialization', () => {
    expect(toDateInputValue(new Date(2026, 7, 20, 0, 15))).toBe('2026-08-20');
  });

  it('zero-pads local month and day values', () => {
    expect(toDateInputValue(new Date(2026, 0, 3, 23, 45))).toBe('2026-01-03');
  });
});
