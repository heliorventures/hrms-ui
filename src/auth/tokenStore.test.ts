import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearLegacyClientRefreshToken,
  clearOperatorSession,
  getClientAccessToken,
  getClientRefreshToken,
  getOperatorAccessToken,
  getOperatorRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
  setOperatorAccessToken,
  setOperatorRefreshToken,
} from './tokenStore';

const TENANT_A = 'e6d4fc13-feb8-52a0-93bd-f66c795969b1';
const TENANT_B = '342205fc-98b1-5421-8a11-b30821c86aa0';

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key) => {
      entries.delete(key);
    },
    setItem: (key, value) => {
      entries.set(key, value);
    },
  };
}

describe('tenant-keyed client refresh token storage', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
    vi.stubGlobal('window', { localStorage: storage });
    setClientAccessToken(null);
    setOperatorAccessToken(null);
  });

  it('stores client refresh tokens independently per tenant', () => {
    setClientRefreshToken(TENANT_A, 'tenant-a-token');
    setClientRefreshToken(TENANT_B, 'tenant-b-token');

    expect(getClientRefreshToken(TENANT_A)).toBe('tenant-a-token');
    expect(getClientRefreshToken(TENANT_B)).toBe('tenant-b-token');
  });

  it('removes the legacy global client refresh token', () => {
    storage.setItem('kabipay.client.refresh', 'legacy-token');
    clearLegacyClientRefreshToken();

    expect(storage.getItem('kabipay.client.refresh')).toBeNull();
  });

  it('clears the operator session without changing tenant tokens', () => {
    setClientAccessToken('tenant-access');
    setClientRefreshToken(TENANT_A, 'tenant-refresh');
    setOperatorAccessToken('operator-access');
    setOperatorRefreshToken('operator-refresh');

    clearOperatorSession();

    expect(getOperatorAccessToken()).toBeNull();
    expect(getOperatorRefreshToken()).toBeNull();
    expect(getClientAccessToken()).toBe('tenant-access');
    expect(getClientRefreshToken(TENANT_A)).toBe('tenant-refresh');
  });
});
