import { describe, expect, it } from 'vitest';

import { parseClientAccessToken } from './clientSession';

function tokenFor(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `header.${encoded}.signature`;
}

describe('parseClientAccessToken permission scopes', () => {
  it('preserves distinct scopes for actions on the same resource', () => {
    const session = parseClientAccessToken(
      tokenFor({
        permissions: ['attendance:read', 'attendance:regularize'],
        permission_scopes: {
          'attendance:read': 'ALL',
          'attendance:regularize': 'SELF',
        },
      })
    );

    expect(session?.permissionScopes['attendance:read']).toBe('ALL');
    expect(session?.permissionScopes['attendance:regularize']).toBe('SELF');
  });
});
