// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GraphClientOptions, HeliorGraphPlane } from '@/api/client';

import { useGraphClient } from './useGraphClient';

const state = vi.hoisted(() => ({
  createGraphClient: vi.fn(),
  expireClientSession: vi.fn(),
  expireOpsSession: vi.fn(),
  tenantId: '11111111-1111-4111-8111-111111111111',
}));

vi.mock('@/api/client', () => ({
  createGraphClient: state.createGraphClient,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    expireClientSession: state.expireClientSession,
    expireOpsSession: state.expireOpsSession,
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: state.tenantId } }),
}));

const HookProbe = ({ plane }: { plane: HeliorGraphPlane }) => {
  useGraphClient(plane);
  return null;
};

function latestOptions(): GraphClientOptions {
  const call = state.createGraphClient.mock.lastCall as
    | [HeliorGraphPlane, GraphClientOptions]
    | undefined;
  if (!call) throw new Error('createGraphClient was not called');
  return call[1];
}

beforeEach(() => {
  state.createGraphClient.mockReset();
  state.createGraphClient.mockImplementation((plane: HeliorGraphPlane) => ({ plane }));
  state.expireClientSession = vi.fn();
  state.expireOpsSession = vi.fn();
});

afterEach(cleanup);

describe('useGraphClient session plane callbacks', () => {
  it('configures the tenant client with only tenant session expiry', () => {
    render(<HookProbe plane="client" />);

    expect(state.createGraphClient).toHaveBeenCalledWith('client', {
      tenantId: state.tenantId,
      onUnauthenticated: state.expireClientSession,
    });
    latestOptions().onUnauthenticated?.();
    expect(state.expireClientSession).toHaveBeenCalledOnce();
    expect(state.expireOpsSession).not.toHaveBeenCalled();
  });

  it('configures the operator client with only operator session expiry', () => {
    render(<HookProbe plane="operator" />);

    expect(state.createGraphClient).toHaveBeenCalledWith('operator', {
      tenantId: state.tenantId,
      onUnauthenticated: state.expireOpsSession,
    });
    latestOptions().onUnauthenticated?.();
    expect(state.expireOpsSession).toHaveBeenCalledOnce();
    expect(state.expireClientSession).not.toHaveBeenCalled();
  });

  it('rebuilds with the latest plane callback instead of retaining a stale closure', () => {
    const view = render(<HookProbe plane="operator" />);
    const firstOptions = latestOptions();
    const firstExpiry = state.expireOpsSession;
    const replacementExpiry = vi.fn();
    state.expireOpsSession = replacementExpiry;

    view.rerender(<HookProbe plane="operator" />);
    const latestExpiry = latestOptions().onUnauthenticated;

    firstOptions.onUnauthenticated?.();
    latestExpiry?.();
    expect(firstExpiry).toHaveBeenCalledOnce();
    expect(replacementExpiry).toHaveBeenCalledOnce();
  });
});
