// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import SubmitTravelModal from './SubmitTravelModal';

const state = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    tenantId: 'tenant-1',
    user: { id: 'user-1' },
    clientSession: { employeeId: 'employee-1', permissions: [], permissionScopes: {} },
  }),
}));

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('requires supporting evidence when creating a travel request', () => {
  render(<SubmitTravelModal isOpen onClose={vi.fn()} />);
  const file = screen.getByLabelText<HTMLInputElement>(/Supporting file/);
  expect(file.type).toBe('file');
  expect(file.required).toBe(true);
});
