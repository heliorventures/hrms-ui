import { describe, expect, it } from 'vitest';
import { refreshTokenTenantId, sessionMatchesTenant } from './tenantSession';

describe('tenant session binding', () => {
  it('extracts only a valid tenant UUID prefix', () => {
    expect(refreshTokenTenantId('e6d4fc13-feb8-52a0-93bd-f66c795969b1.opaque')).toBe(
      'e6d4fc13-feb8-52a0-93bd-f66c795969b1'
    );
    expect(refreshTokenTenantId('demo.opaque')).toBeNull();
  });

  it('requires exact authenticated and resolved tenant equality', () => {
    expect(
      sessionMatchesTenant(
        'e6d4fc13-feb8-52a0-93bd-f66c795969b1',
        'e6d4fc13-feb8-52a0-93bd-f66c795969b1'
      )
    ).toBe(true);
    expect(
      sessionMatchesTenant(
        '342205fc-98b1-5421-8a11-b30821c86aa0',
        'e6d4fc13-feb8-52a0-93bd-f66c795969b1'
      )
    ).toBe(false);
    expect(sessionMatchesTenant(null, 'e6d4fc13-feb8-52a0-93bd-f66c795969b1')).toBe(false);
  });
});
