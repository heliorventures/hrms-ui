// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { LeaveBoardQuery, LeaveWorkflowTrailQueryQuery } from '../../../api/graphql/graphql';
import { useLeaveWorkflowTrail, type LeaveWorkflowTrailClient } from './useLeaveWorkflowTrail';

afterEach(cleanup);

describe('useLeaveWorkflowTrail', () => {
  it('retains and retries the exact failed workflow-trail read', async () => {
    const requestedIds: string[] = [];
    let attempt = 0;
    const client: LeaveWorkflowTrailClient = {
      request: async <T,>(_document: unknown, variables: { leaveRequestId: string }) => {
        requestedIds.push(variables.leaveRequestId);
        attempt += 1;
        if (attempt === 1) throw new Error('network error');
        return { leaveRequestWorkflowTrail: [] } as T;
      },
    };
    const request = { id: 'leave-request-1' } as LeaveBoardQuery['leaveRequests'][number];
    const { result } = renderHook(() => useLeaveWorkflowTrail(client));

    await act(async () => {
      await result.current.open(request);
    });
    expect(result.current.failure?.operation).toBe('workflowTrail');
    expect(result.current.failure?.request.id).toBe('leave-request-1');

    await act(async () => {
      await result.current.retry();
    });
    expect(requestedIds).toEqual(['leave-request-1', 'leave-request-1']);
    expect(result.current.failure).toBeNull();
    expect(result.current.summaryRow?.id).toBe('leave-request-1');
  });

  it('keeps the latest selected request when an older response finishes last', async () => {
    const pending = new Map<string, (value: LeaveWorkflowTrailQueryQuery) => void>();
    const client: LeaveWorkflowTrailClient = {
      request: <T,>(_document: unknown, variables: { leaveRequestId: string }) =>
        new Promise<T>((resolve) => {
          pending.set(variables.leaveRequestId, (value) => resolve(value as T));
        }),
    };
    const first = { id: 'leave-request-1' } as LeaveBoardQuery['leaveRequests'][number];
    const second = { id: 'leave-request-2' } as LeaveBoardQuery['leaveRequests'][number];
    const firstRows = [
      { workflowStepName: 'First request' },
    ] as LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail'];
    const secondRows = [
      { workflowStepName: 'Second request' },
    ] as LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail'];
    const { result } = renderHook(() => useLeaveWorkflowTrail(client));
    let firstOpen!: Promise<void>;
    let secondOpen!: Promise<void>;

    act(() => {
      firstOpen = result.current.open(first);
      secondOpen = result.current.open(second);
    });
    await act(async () => {
      pending.get('leave-request-2')?.({ leaveRequestWorkflowTrail: secondRows });
      await secondOpen;
    });
    await act(async () => {
      pending.get('leave-request-1')?.({ leaveRequestWorkflowTrail: firstRows });
      await firstOpen;
    });

    expect(result.current.summaryRow?.id).toBe('leave-request-2');
    expect(result.current.rows).toBe(secondRows);
    expect(result.current.loading).toBe(false);
  });

  it('does not reopen a closed trail when its request finishes later', async () => {
    let resolveRequest!: (value: LeaveWorkflowTrailQueryQuery) => void;
    const client: LeaveWorkflowTrailClient = {
      request: <T,>() =>
        new Promise<T>((resolve) => {
          resolveRequest = (value) => resolve(value as T);
        }),
    };
    const request = { id: 'leave-request-1' } as LeaveBoardQuery['leaveRequests'][number];
    const { result } = renderHook(() => useLeaveWorkflowTrail(client));
    let opening!: Promise<void>;

    act(() => {
      opening = result.current.open(request);
    });
    act(() => result.current.close());
    await act(async () => {
      resolveRequest({
        leaveRequestWorkflowTrail: [
          { workflowStepName: 'Late response' },
        ] as LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail'],
      });
      await opening;
    });

    expect(result.current.summaryRow).toBeNull();
    expect(result.current.rows).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('ignores a response owned by a previous graph client', async () => {
    let resolveOldRequest!: (value: LeaveWorkflowTrailQueryQuery) => void;
    const oldClient: LeaveWorkflowTrailClient = {
      request: <T,>() =>
        new Promise<T>((resolve) => {
          resolveOldRequest = (value) => resolve(value as T);
        }),
    };
    const newRows = [
      { workflowStepName: 'Current tenant request' },
    ] as LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail'];
    const newClient: LeaveWorkflowTrailClient = {
      request: async <T,>() => ({ leaveRequestWorkflowTrail: newRows }) as T,
    };
    const oldRequest = { id: 'old-owner-request' } as LeaveBoardQuery['leaveRequests'][number];
    const newRequest = { id: 'new-owner-request' } as LeaveBoardQuery['leaveRequests'][number];
    const { result, rerender } = renderHook(({ owner }) => useLeaveWorkflowTrail(owner), {
      initialProps: { owner: oldClient },
    });
    let oldOpening!: Promise<void>;

    act(() => {
      oldOpening = result.current.open(oldRequest);
    });
    rerender({ owner: newClient });
    await act(async () => {
      await result.current.open(newRequest);
    });
    await act(async () => {
      resolveOldRequest({
        leaveRequestWorkflowTrail: [
          { workflowStepName: 'Stale tenant request' },
        ] as LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail'],
      });
      await oldOpening;
    });

    expect(result.current.summaryRow?.id).toBe('new-owner-request');
    expect(result.current.rows).toBe(newRows);
  });

  it('never publishes an already-loaded summary or rows to a replacement client render', async () => {
    const oldRows = [
      { workflowStepName: 'Previous tenant approval' },
    ] as LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail'];
    const oldClient: LeaveWorkflowTrailClient = {
      request: async <T,>() => ({ leaveRequestWorkflowTrail: oldRows }) as T,
    };
    const newClient: LeaveWorkflowTrailClient = {
      request: async <T,>() => ({ leaveRequestWorkflowTrail: [] }) as T,
    };
    const oldRequest = { id: 'previous-tenant-request' } as LeaveBoardQuery['leaveRequests'][number];
    const published: Array<{
      owner: LeaveWorkflowTrailClient;
      rows: LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail'];
      summaryId: string | null;
    }> = [];
    const { result, rerender } = renderHook(
      ({ owner }) => {
        const trail = useLeaveWorkflowTrail(owner);
        published.push({ owner, rows: trail.rows, summaryId: trail.summaryRow?.id ?? null });
        return trail;
      },
      { initialProps: { owner: oldClient } }
    );

    await act(async () => {
      await result.current.open(oldRequest);
    });
    expect(result.current.rows).toBe(oldRows);
    published.length = 0;

    rerender({ owner: newClient });

    const replacementClientRenders = published.filter(({ owner }) => owner === newClient);
    expect(replacementClientRenders.length).toBeGreaterThan(0);
    expect(replacementClientRenders).toEqual(
      replacementClientRenders.map(() => ({ owner: newClient, rows: [], summaryId: null }))
    );
  });

  it('never publishes an already-loaded failure to a replacement client render', async () => {
    const oldClient: LeaveWorkflowTrailClient = {
      request: async () => {
        throw new Error('previous tenant failure');
      },
    };
    const newClient: LeaveWorkflowTrailClient = {
      request: async <T,>() => ({ leaveRequestWorkflowTrail: [] }) as T,
    };
    const oldRequest = { id: 'previous-tenant-request' } as LeaveBoardQuery['leaveRequests'][number];
    const published: Array<{
      failureMessage: string | null;
      owner: LeaveWorkflowTrailClient;
    }> = [];
    const { result, rerender } = renderHook(
      ({ owner }) => {
        const trail = useLeaveWorkflowTrail(owner);
        published.push({ failureMessage: trail.failure?.message ?? null, owner });
        return trail;
      },
      { initialProps: { owner: oldClient } }
    );

    await act(async () => {
      await result.current.open(oldRequest);
    });
    expect(result.current.failure).not.toBeNull();
    published.length = 0;

    rerender({ owner: newClient });

    const replacementClientRenders = published.filter(({ owner }) => owner === newClient);
    expect(replacementClientRenders.length).toBeGreaterThan(0);
    expect(replacementClientRenders.every(({ failureMessage }) => failureMessage === null)).toBe(
      true
    );
  });
});
