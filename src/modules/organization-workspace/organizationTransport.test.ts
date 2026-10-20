import { expect, it, vi } from 'vitest';

import { createGraphClient } from '../../api/client';

vi.mock('../../config', () => ({
  getAppConfig: () => ({ gatewayUrl: 'https://example.test/graphql' }),
}));
vi.mock('../../auth/tokenStore', () => ({
  getClientAccessToken: () => 'source-session-token',
  getOperatorAccessToken: () => 'operator-token',
}));
const configuredHeaders = (client: ReturnType<typeof createGraphClient>) =>
  (
    client as unknown as { requestConfig: { headers: () => Record<string, string> } }
  ).requestConfig.headers();

it('keeps source authentication headers separate from the selected target company', () => {
  const client = createGraphClient('client', {
    tenantId: 'source-company',
    loginCompanyId: 'source-company',
  });
  const headers = new Headers(configuredHeaders(client));
  expect(headers.get('x-tenant-id')).toBe('source-company');
  expect(headers.get('x-login-company-id')).toBe('source-company');
  expect(headers.get('authorization')).toBe('Bearer source-session-token');
  expect([...headers.values()]).not.toContain('target-company');
});

it('does not add organization routing headers to ordinary tenant requests', () => {
  const client = createGraphClient('client', { tenantId: 'source-company' });
  expect(new Headers(configuredHeaders(client)).has('x-login-company-id')).toBe(false);
});
