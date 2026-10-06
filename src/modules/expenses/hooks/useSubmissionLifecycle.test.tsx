// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTravelSubmission } from './useTravelSubmission';

const state = vi.hoisted(() => ({
  auth: {
    tenantId: 'tenant-a',
    user: { id: 'user-a' },
    clientSession: { employeeId: 'employee-a', permissions: [], permissionScopes: {} },
  },
  client: { request: vi.fn() },
  upload: vi.fn(),
}));
vi.mock('../../../contexts/AuthContext', () => ({ useAuth: () => state.auth }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../../utils/tenantFileUpload', () => ({
  uploadTenantFile: state.upload,
  validateTenantUploadFile: () => null,
}));
afterEach(cleanup);
describe('travel submission lifecycle', () => {
  it('resets drafts on ownership changes and suppresses the old save completion', async () => {
    let finish: (value: unknown) => void = () => undefined;
    state.client.request.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    state.upload.mockResolvedValue('file-a');
    const onClose = vi.fn(),
      onSubmitted = vi.fn();
    const { result, rerender } = renderHook(() =>
      useTravelSubmission({ isOpen: true, onClose, onSubmitted })
    );
    const fields = {
      fromLocation: 'Office A',
      toLocation: 'Office B',
      fromDate: '2099-01-01',
      toDate: '2099-01-02',
      purpose: 'Meeting',
      estimatedCost: '100',
    };
    act(() => {
      for (const [name, value] of Object.entries(fields))
        result.current.handleChange({
          target: { name, value },
        } as React.ChangeEvent<HTMLInputElement>);
      result.current.setFile(new File(['pdf'], 'trip.pdf', { type: 'application/pdf' }));
    });
    let pending: Promise<void> | undefined;
    act(() => {
      pending = result.current.handleSubmit({ preventDefault: () => undefined } as React.FormEvent);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(state.client.request).toHaveBeenCalledOnce();
    state.auth = { ...state.auth, tenantId: 'tenant-b' };
    rerender();
    expect(result.current.formData.purpose).toBe('');
    expect(result.current.submitting).toBe(false);
    await act(async () => {
      finish({});
      await pending;
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(onSubmitted).not.toHaveBeenCalled();
  });
});
