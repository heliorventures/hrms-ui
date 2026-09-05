import { describe, expect, it } from 'vitest';
import { formatTenantTime, tenantDateKey } from './tenantTime';

describe('tenant time display', () => {
  it('converts UTC instants into IST without using the browser zone', () => {
    expect(formatTenantTime('2026-09-04T15:43:27Z', 'Asia/Kolkata')).toBe('21:13:27');
    expect(formatTenantTime('2026-09-04T15:43:27Z', 'UTC')).toBe('15:43:27');
  });
  it('rolls over at tenant midnight', () => {
    expect(tenantDateKey(new Date('2026-09-05T18:29:59Z'), 'Asia/Kolkata')).toBe('2026-09-05');
    expect(tenantDateKey(new Date('2026-09-05T18:30:00Z'), 'Asia/Kolkata')).toBe('2026-09-06');
  });
  it('does not invent a time for absent or invalid instants', () => {
    expect(formatTenantTime(null, 'Asia/Kolkata')).toBe('—');
    expect(formatTenantTime('15:43:27', 'Asia/Kolkata')).toBe('—');
  });
});
