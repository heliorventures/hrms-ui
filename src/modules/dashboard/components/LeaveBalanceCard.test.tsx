// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LeaveBalanceCard from './LeaveBalanceCard';

const graphState = vi.hoisted(() => ({
  client: { request: vi.fn() },
}));

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const deferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const leaveType = (index: number) => ({
  id: `type-${index}`,
  name: `Leave Type ${index}`,
  code: `LT${index}`,
});

const balance = (index: number) => ({
  id: `balance-${index}`,
  leaveTypeId: `type-${index}`,
  year: new Date().getFullYear(),
  balanceDays: '10',
  entitledDays: '12',
  pendingDays: '1',
  usedDays: '2',
});

function responseForVariables(variables: { limit: number }) {
  if (variables.limit === 50) return { leaveTypes: [leaveType(0)] };
  return { leaveBalances: [balance(0)] };
}

function renderCard() {
  return render(
    <MemoryRouter future={routerFuture}>
      <LeaveBalanceCard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  graphState.client.request = vi.fn((_document, variables) =>
    Promise.resolve(responseForVariables(variables as { limit: number }))
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('LeaveBalanceCard truthful states', () => {
  it('renders an actionable initial failure without valid empty copy', async () => {
    graphState.client.request = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    renderCard();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Leave Balances Could Not Be Loaded');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.queryByText('No Leave Balances Yet.')).toBeNull();
  });

  it('renders intentional empty copy after both requests succeed', async () => {
    graphState.client.request = vi.fn((_document, variables) =>
      Promise.resolve(
        (variables as { limit: number }).limit === 50 ? { leaveTypes: [] } : { leaveBalances: [] }
      )
    );
    renderCard();

    expect(await screen.findByText('No Leave Balances Yet.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('starts the independent balance and leave-type requests together', async () => {
    const types = deferred<{ leaveTypes: ReturnType<typeof leaveType>[] }>();
    graphState.client.request = vi.fn((_document, variables) => {
      if ((variables as { limit: number }).limit === 50) return types.promise;
      return Promise.resolve({ leaveBalances: [balance(0)] });
    });
    renderCard();

    await waitFor(() => expect(graphState.client.request).toHaveBeenCalledTimes(2));
    act(() => types.resolve({ leaveTypes: [leaveType(0)] }));
    expect(await screen.findByText('Leave Type 0')).toBeTruthy();
  });

  it('shows loading while retrying an initial failure and then renders ready data', async () => {
    let fail = true;
    const retryBalances = deferred<{ leaveBalances: ReturnType<typeof balance>[] }>();
    graphState.client.request = vi.fn((_document, variables) => {
      const { limit } = variables as { limit: number };
      if (fail) return Promise.reject(new Error('Failed to fetch'));
      if (limit === 50) return Promise.resolve({ leaveTypes: [leaveType(0)] });
      return retryBalances.promise;
    });
    const user = userEvent.setup();
    renderCard();

    await screen.findByRole('alert');
    fail = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Loading Leave Balances…')).toBeTruthy();

    act(() => retryBalances.resolve({ leaveBalances: [balance(0)] }));
    expect(await screen.findByText('Leave Type 0')).toBeTruthy();
  });

  it('retains balances and offers recovery after a refresh failure', async () => {
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Leave Type 0');
    graphState.client.request.mockRejectedValue(new Error('Failed to fetch'));

    await user.click(screen.getByRole('button', { name: 'Refresh Leave Balances' }));

    expect(await screen.findByText('Leave Balances May Be Out of Date')).toBeTruthy();
    expect(screen.getByText('Leave Type 0')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('shows possibility wording for each collection at its exact cap', async () => {
    graphState.client.request = vi.fn((_document, variables) => {
      const { limit } = variables as { limit: number };
      return Promise.resolve(
        limit === 50
          ? { leaveTypes: Array.from({ length: 50 }, (_, index) => leaveType(index)) }
          : { leaveBalances: Array.from({ length: 20 }, (_, index) => balance(index)) }
      );
    });
    renderCard();

    await screen.findByText('Leave Type 0');
    expect(
      screen.getByText('Showing up to 20 leave balances. More may be available.')
    ).toBeTruthy();
    expect(screen.getByText('Showing up to 50 leave types. More may be available.')).toBeTruthy();
  });

  it('keeps long leave type names contained and uses a Title Case action link', async () => {
    const longTypeName = `Extended Leave Type ${'X'.repeat(160)}`;
    graphState.client.request = vi.fn((_document, variables) =>
      Promise.resolve(
        (variables as { limit: number }).limit === 50
          ? { leaveTypes: [{ ...leaveType(0), name: longTypeName }] }
          : { leaveBalances: [balance(0)] }
      )
    );
    renderCard();

    const typeName = await screen.findByText(longTypeName);
    expect(typeName.className).toContain('min-w-0');
    expect(typeName.className).toContain('break-words');
    expect(screen.getByRole('link', { name: 'Open Leave Center →' })).toBeTruthy();
  });
});
