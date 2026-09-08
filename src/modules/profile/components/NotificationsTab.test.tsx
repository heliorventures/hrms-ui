// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationsTab from './NotificationsTab';

const graphClient = vi.hoisted(() => ({
  request: vi.fn<[unknown, unknown?], Promise<unknown>>(),
}));

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphClient,
}));

beforeEach(() => {
  graphClient.request.mockReset();
  graphClient.request.mockImplementation((document: unknown) => {
    if (typeof document === 'string' && document.includes('UpdateMyCelebrationPreferences')) {
      return Promise.resolve({
        updateMyCelebrationPreferences: {
          shareBirthday: true,
          shareWorkAnniversary: true,
        },
      });
    }
    if (typeof document === 'string' && document.includes('MyCelebrationPreferences')) {
      return Promise.resolve({
        myCelebrationPreferences: {
          shareBirthday: false,
          shareWorkAnniversary: true,
        },
      });
    }
    return Promise.resolve({
      myNotificationPreferences: {
        inAppEnabled: true,
        announcementsEnabled: true,
        mutedTopics: [],
      },
    });
  });
});

afterEach(cleanup);

describe('NotificationsTab celebration privacy', () => {
  it('shows celebrations as a mute category and keeps company sharing opt-in', async () => {
    render(<NotificationsTab />);

    expect(await screen.findByText('Mute Celebrations')).toBeTruthy();
    expect(
      screen.getByRole<HTMLInputElement>('checkbox', { name: 'Share my birthday company-wide' })
        .checked
    ).toBe(false);
    expect(
      screen.getByRole<HTMLInputElement>('checkbox', {
        name: 'Share my work anniversary company-wide',
      }).checked
    ).toBe(true);
  });

  it('saves only the signed-in employee celebration choices', async () => {
    const user = userEvent.setup();
    render(<NotificationsTab />);

    const birthday = await screen.findByRole('checkbox', {
      name: 'Share my birthday company-wide',
    });
    await user.click(birthday);
    await user.click(screen.getByRole('button', { name: 'Save Celebration Privacy' }));

    await waitFor(() => {
      const call = graphClient.request.mock.calls.find(
        ([document]) =>
          typeof document === 'string' && document.includes('UpdateMyCelebrationPreferences')
      );
      expect(call?.[1]).toEqual({
        input: {
          shareBirthday: true,
          shareWorkAnniversary: true,
        },
      });
    });
  });
});
