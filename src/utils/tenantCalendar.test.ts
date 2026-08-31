import { describe, expect, it } from 'vitest';

import { tenantCalendarPeriod } from './tenantCalendar';

describe('tenantCalendarPeriod', () => {
  it('uses the tenant timezone when browser-local and tenant calendar dates differ', () => {
    const instant = new Date('2027-01-01T04:59:59.900Z');

    expect(tenantCalendarPeriod(instant, 'America/New_York')).toEqual({
      month: 12,
      year: 2026,
    });
  });

  it('rejects invalid tenant timezone configuration', () => {
    expect(() => tenantCalendarPeriod(new Date(), 'Not/A-Timezone')).toThrow(RangeError);
  });
});
