// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { notificationMocks, renderNotifications } from './NotificationDropdown.testSupport';

it('expands a notification message separately from opening its action', async () => {
  renderNotifications();
  fireEvent.click(await screen.findByRole('button', { name: 'Notifications, 3 unread' }));
  const title = await screen.findByText('Policy update');
  const details = title.closest('details');
  expect(details?.open).toBe(false);
  fireEvent.click(title.closest('summary') ?? title);
  expect(details?.open).toBe(true);
  expect(notificationMocks().navigate).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Open Policy update' })).toBeTruthy();
});
