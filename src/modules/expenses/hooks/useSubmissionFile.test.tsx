// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSubmissionFile } from './useSubmissionFile';

const state = vi.hoisted(() => ({
  owner: {
    tenantId: 'tenant-1',
    user: { id: 'user-1' },
    clientSession: { employeeId: 'employee-1', permissions: [], permissionScopes: {} },
  },
  upload: vi.fn(),
}));
vi.mock('../../../contexts/AuthContext', () => ({ useAuth: () => state.owner }));
vi.mock('../../../utils/tenantFileUpload', async (original) => ({
  ...(await original<typeof import('../../../utils/tenantFileUpload')>()),
  uploadTenantFile: state.upload,
}));
const client = { request: vi.fn() } as unknown as GraphQLClient;
const receipt = () => new File(['%PDF-1.4'], 'receipt.pdf', { type: 'application/pdf' });

beforeEach(() => {
  state.owner = {
    tenantId: 'tenant-1',
    user: { id: 'user-1' },
    clientSession: { employeeId: 'employee-1', permissions: [], permissionScopes: {} },
  };
  state.upload.mockReset().mockResolvedValue('file-1');
});
afterEach(cleanup);

describe('submission file ownership and retries', () => {
  it('shares one active upload and caches its successful ID', async () => {
    const { result } = renderHook(() => useSubmissionFile(client));
    act(() => result.current.setFile(receipt()));
    await expect(
      Promise.all([result.current.ensureUploaded(), result.current.ensureUploaded()])
    ).resolves.toEqual(['file-1', 'file-1']);
    await expect(result.current.ensureUploaded()).resolves.toBe('file-1');
    expect(state.upload).toHaveBeenCalledTimes(1);
  });

  it('invalidates cached IDs when the selected file is replaced', async () => {
    const { result } = renderHook(() => useSubmissionFile(client));
    act(() => result.current.setFile(receipt()));
    await result.current.ensureUploaded();
    state.upload.mockResolvedValue('file-2');
    act(() => result.current.setFile(receipt()));
    await expect(result.current.ensureUploaded()).resolves.toBe('file-2');
    expect(state.upload).toHaveBeenCalledTimes(2);
  });

  it('ignores an upload completion after changing owner', async () => {
    let complete: ((id: string) => void) | undefined;
    state.upload.mockReturnValue(
      new Promise<string>((resolve) => {
        complete = resolve;
      })
    );
    const { result, rerender } = renderHook(() => useSubmissionFile(client));
    act(() => result.current.setFile(receipt()));
    const pending = result.current.ensureUploaded();
    const rejected = expect(pending).rejects.toThrow(/owner or file changed/);
    state.owner = { ...state.owner, tenantId: 'tenant-2' };
    rerender();
    complete?.('stale-file');
    await rejected;
    expect(result.current.file).toBeNull();
    await expect(result.current.ensureUploaded()).rejects.toThrow(/required/);
  });

  it('clears a pending upload on reset', async () => {
    let complete: ((id: string) => void) | undefined;
    state.upload.mockReturnValue(
      new Promise<string>((resolve) => {
        complete = resolve;
      })
    );
    const { result } = renderHook(() => useSubmissionFile(client));
    act(() => result.current.setFile(receipt()));
    const rejected = expect(result.current.ensureUploaded()).rejects.toThrow(
      /owner or file changed/
    );
    act(() => result.current.reset());
    complete?.('stale-file');
    await rejected;
  });

  it.each([
    new File([], 'empty.pdf', { type: 'application/pdf' }),
    new File(['text'], 'script.html', { type: 'text/html' }),
    new File([new Uint8Array(6 * 1024 * 1024 + 1)], 'large.pdf', { type: 'application/pdf' }),
  ])('rejects invalid evidence before starting an upload: $name', async (file) => {
    const { result } = renderHook(() => useSubmissionFile(client));
    act(() => result.current.setFile(file));
    await expect(result.current.ensureUploaded()).rejects.toThrow();
    expect(state.upload).not.toHaveBeenCalled();
  });

  it('permits retry after an upload failure', async () => {
    state.upload.mockRejectedValueOnce(new Error('Storage unavailable'));
    const { result } = renderHook(() => useSubmissionFile(client));
    act(() => result.current.setFile(receipt()));
    await expect(result.current.ensureUploaded()).rejects.toThrow('Storage unavailable');
    await expect(result.current.ensureUploaded()).resolves.toBe('file-1');
  });
});
