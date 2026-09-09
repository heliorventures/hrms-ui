// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import UpcomingHolidays from './UpcomingHolidays';

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

const holiday = (index: number) => ({
  id: `holiday-${index}`,
  holidayDate: `2026-12-${String((index % 20) + 1).padStart(2, '0')}`,
  name: `Holiday ${index}`,
  calendarName: 'Company Calendar',
  holidayType: 'PUBLIC',
});

const holidays = (count: number) => ({
  upcomingHolidays: Array.from({ length: count }, (_, index) => holiday(index)),
});

function renderCard() {
  return render(
    <MemoryRouter future={routerFuture}>
      <UpcomingHolidays />
    </MemoryRouter>
  );
}

beforeEach(() => {
  graphState.client.request = vi.fn().mockResolvedValue(holidays(1));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('UpcomingHolidays truthful states', () => {
  it('shows compact dates and reveals holiday details by hover or keyboard without type badges', async () => {
    const user = userEvent.setup();
    renderCard();
    const date = await screen.findByRole('button', { name: /Holiday 0,/ });
    expect(date.textContent).not.toContain('Holiday 0');
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(screen.queryByText('PUBLIC')).toBeNull();
    await user.hover(date);
    expect(screen.getByRole('tooltip').textContent).toContain('Holiday 0');
    await user.unhover(date);
    act(() => date.focus());
    expect(screen.getByRole('tooltip').textContent).toContain('Company Calendar');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.click(date);
    expect(screen.getByRole('tooltip')).toBeTruthy();
  });
  it('renders an actionable initial failure without valid empty copy', async () => {
    graphState.client.request.mockRejectedValue(new Error('Failed to fetch'));
    renderCard();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Upcoming Holidays Could Not Be Loaded');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.queryByText('No Upcoming Holidays in Range.')).toBeNull();
  });

  it('renders intentional empty copy after a successful empty response', async () => {
    graphState.client.request.mockResolvedValue(holidays(0));
    renderCard();

    expect(await screen.findByText('No Upcoming Holidays in Range.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows loading while retrying an initial failure and then renders ready data', async () => {
    const retry = deferred<ReturnType<typeof holidays>>();
    graphState.client.request
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockImplementationOnce(() => retry.promise);
    const user = userEvent.setup();
    renderCard();

    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Loading Upcoming Holidays…')).toBeTruthy();

    act(() => retry.resolve(holidays(1)));
    expect(await screen.findByText('Holiday 0')).toBeTruthy();
  });

  it('retains holidays and offers recovery after a refresh failure', async () => {
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Holiday 0');
    graphState.client.request.mockRejectedValue(new Error('Failed to fetch'));

    await user.click(screen.getByRole('button', { name: 'Refresh Upcoming Holidays' }));

    expect(await screen.findByText('Upcoming Holidays May Be Out of Date')).toBeTruthy();
    expect(screen.getByText('Holiday 0')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('shows possibility wording at the exact twelve-holiday cap', async () => {
    graphState.client.request.mockResolvedValue(holidays(12));
    renderCard();

    await screen.findByText('Holiday 0');
    expect(screen.getByText('Showing 3 upcoming holidays. More may be available.')).toBeTruthy();
    expect(graphState.client.request).toHaveBeenCalledWith(expect.anything(), { limit: 12 });
  });

  it('contains long holiday content and uses a Title Case action link', async () => {
    const longHolidayName = `Holiday ${'H'.repeat(160)}`;
    const longCalendarName = `Calendar ${'K'.repeat(180)}`;
    graphState.client.request.mockResolvedValue({
      upcomingHolidays: [{ ...holiday(0), name: longHolidayName, calendarName: longCalendarName }],
    });
    renderCard();

    const holidayName = await screen.findByText(longHolidayName);
    expect(holidayName.className).toContain('min-w-0');
    expect(holidayName.className).toContain('break-words');
    const calendarName = screen.getByText((content) => content.includes(longCalendarName));
    expect(calendarName.className).toContain('break-words');
    expect(screen.getByRole('link', { name: 'Show All Holidays →' })).toBeTruthy();
  });
});
