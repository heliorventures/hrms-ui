// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';

import { useKeyedAction } from '../../hooks/useKeyedAction';

import { useSurveyCatalog } from './useSurveyCatalog';

const client = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => client }));
const run = async (_key: string, operation: () => Promise<void>) => operation();
afterEach(cleanup);

it('loads the current catalog after StrictMode effect cleanup and replay', async () => {
  client.request
    .mockReset()
    .mockResolvedValue({
      surveys: [
        {
          id: 'survey',
          title: 'Pulse',
          status: 'DRAFT',
          minimumReportGroupSize: 5,
          completed: false,
        },
      ],
    });
  const hook = renderHook(
    () => {
      const action = useKeyedAction();
      return useSurveyCatalog(true, false, false, action.run);
    },
    { wrapper: StrictMode }
  );
  await waitFor(() => expect(hook.result.current.adminSurveys[0]?.id).toBe('survey'));
});

it('keeps the newer catalog state when an earlier refresh finishes later', async () => {
  let resolveOld!: (value: unknown) => void;
  const old = new Promise((resolve) => {
    resolveOld = resolve;
  });
  const row = {
    id: 'survey',
    title: 'Pulse',
    status: 'CLOSED',
    minimumReportGroupSize: 5,
    completed: false,
  };
  client.request
    .mockReset()
    .mockReturnValueOnce(old)
    .mockResolvedValueOnce({ surveys: [row] });
  const hook = renderHook(() => useSurveyCatalog(true, false, false, run));
  await act(async () => hook.result.current.load());
  await waitFor(() => expect(hook.result.current.adminSurveys[0]?.status).toBe('CLOSED'));
  await act(async () => resolveOld({ surveys: [{ ...row, status: 'PUBLISHED' }] }));
  expect(hook.result.current.adminSurveys[0]?.status).toBe('CLOSED');
});
