import type { GraphQLClient } from 'graphql-request';
import { describe, expect, it, vi } from 'vitest';

import { dismissMyApplicationOverview, loadMyGuidanceState } from './guidanceClient';

function createClient(request: ReturnType<typeof vi.fn>): GraphQLClient {
  return { request } as unknown as GraphQLClient;
}

describe('guidanceClient', () => {
  it('returns null when the overview has never been dismissed', async () => {
    const request = vi.fn().mockResolvedValue({
      myGuidanceState: { overviewDismissedAt: null },
    });

    await expect(loadMyGuidanceState(createClient(request))).resolves.toBeNull();
    expect(request).toHaveBeenCalledOnce();
    request.mock.calls.forEach((call) => expect(call).toHaveLength(1));
  });

  it('converts a recorded dismissal timestamp to a Date', async () => {
    const request = vi.fn().mockResolvedValue({
      myGuidanceState: { overviewDismissedAt: '2026-09-29T10:30:00Z' },
    });

    await expect(loadMyGuidanceState(createClient(request))).resolves.toEqual(
      new Date('2026-09-29T10:30:00Z')
    );
  });

  it('preserves read transport errors', async () => {
    const error = new Error('Gateway unavailable');
    const request = vi.fn().mockRejectedValue(error);

    await expect(loadMyGuidanceState(createClient(request))).rejects.toBe(error);
  });

  it.each([
    '2026-02-31T10:30:00Z',
    '2026-09-29T24:00:00Z',
    '2026-09-29T10:60:00Z',
    '2026-09-29T10:30:60Z',
    '2026-09-29T10:30:00+05:60',
  ])('rejects invalid read timestamps (%s)', async (timestamp) => {
    const request = vi.fn().mockResolvedValue({
      myGuidanceState: { overviewDismissedAt: timestamp },
    });

    await expect(loadMyGuidanceState(createClient(request))).rejects.toThrow(RangeError);
  });

  it('preserves fractional seconds and timezone offsets when creating a Date', async () => {
    const request = vi.fn().mockResolvedValue({
      myGuidanceState: { overviewDismissedAt: '2026-09-29T10:30:00.125+05:30' },
    });

    await expect(loadMyGuidanceState(createClient(request))).resolves.toEqual(
      new Date('2026-09-29T10:30:00.125+05:30')
    );
  });

  it('does not treat a missing schema field as an undismissed state', async () => {
    const request = vi.fn().mockResolvedValue({ myGuidanceState: {} });

    await expect(loadMyGuidanceState(createClient(request))).rejects.toThrow(TypeError);
  });

  it('returns the recorded dismissal Date', async () => {
    const request = vi.fn().mockResolvedValue({
      dismissMyApplicationOverview: { overviewDismissedAt: '2026-09-29T10:30:00Z' },
    });

    await expect(dismissMyApplicationOverview(createClient(request))).resolves.toEqual(
      new Date('2026-09-29T10:30:00Z')
    );
    request.mock.calls.forEach((call) => expect(call).toHaveLength(1));
  });

  it('preserves dismiss transport errors', async () => {
    const error = new Error('Gateway unavailable');
    const request = vi.fn().mockRejectedValue(error);

    await expect(dismissMyApplicationOverview(createClient(request))).rejects.toBe(error);
  });

  it('rejects a dismissal response without a timestamp', async () => {
    const request = vi.fn().mockResolvedValue({
      dismissMyApplicationOverview: { overviewDismissedAt: null },
    });

    await expect(dismissMyApplicationOverview(createClient(request))).rejects.toThrow(TypeError);
  });
});
