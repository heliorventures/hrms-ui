// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DialogProvider } from '../../contexts/DialogContext';

import AdminNotificationsPage from './AdminNotificationsPage';

const graphState = vi.hoisted(() => ({
  client: {
    request: vi.fn<[unknown, unknown?], Promise<unknown>>(),
  },
}));

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

const consoleData = {
  adminAnnouncements: [
    {
      id: 'announcement-1',
      title: 'HR policy update',
      body: 'Please review the updated policy.',
      targetAudience: 'ROLE:HR_ADMIN',
      targetDepartmentId: null,
      targetLocationId: null,
      postSource: 'company_announcement',
      publishAt: null,
      expiresAt: null,
      createdAt: '2026-08-21T00:00:00.000Z',
    },
  ],
  adminNotifications: [],
  employees: [],
  departments: [{ id: 'department-engineering', name: 'Engineering' }],
};

const renderPage = () =>
  render(
    <DialogProvider>
      <AdminNotificationsPage />
    </DialogProvider>
  );

const openStoredRoleAnnouncement = async (user: ReturnType<typeof userEvent.setup>) => {
  await screen.findByRole('button', { name: 'Edit' });
  await user.click(screen.getByRole('button', { name: 'Edit' }));
};

const hasUpdateInput = (value: unknown): value is { input: Record<string, unknown> } => {
  if (!value || typeof value !== 'object' || !('input' in value)) return false;
  const { input } = value;
  return input !== null && typeof input === 'object' && 'id' in input;
};

const updateInput = (): Record<string, unknown> => {
  const updateCall = graphState.client.request.mock.calls.find(
    ([, variables]) => hasUpdateInput(variables) && variables.input.id === 'announcement-1'
  );
  const variables = updateCall?.[1];
  if (!hasUpdateInput(variables)) throw new Error('Expected the announcement update request.');
  return variables.input;
};

const announcementTitleInput = () =>
  screen.getAllByRole('textbox', { name: 'Title' })[0] as HTMLInputElement;

beforeEach(() => {
  graphState.client = {
    request: vi.fn<[unknown, unknown?], Promise<unknown>>().mockResolvedValue(consoleData),
  };
});

afterEach(cleanup);

describe('AdminNotificationsPage announcement audience editing', () => {
  it('hydrates a stored role audience as a normalized role code', async () => {
    const user = userEvent.setup();
    renderPage();

    await openStoredRoleAnnouncement(user);

    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Target Role Code' }).value).toBe(
      'HR_ADMIN'
    );
  });

  it('preserves the stored role when only the title changes', async () => {
    const user = userEvent.setup();
    renderPage();
    await openStoredRoleAnnouncement(user);

    await user.clear(announcementTitleInput());
    await user.type(announcementTitleInput(), 'Updated HR policy');
    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));

    await waitFor(() =>
      expect(updateInput()).toMatchObject({
        targetRoleCode: 'HR_ADMIN',
        clearRoleAudience: false,
      })
    );
  });

  it('requires the explicit clear control and confirmation before clearing a stored role', async () => {
    const user = userEvent.setup();
    renderPage();
    await openStoredRoleAnnouncement(user);

    const roleInput = screen.getByRole('textbox', { name: 'Target Role Code' });
    const clearRoleCheckbox = screen.getByRole('checkbox', { name: 'Clear role targeting' });
    await user.click(clearRoleCheckbox);

    expect((roleInput as HTMLInputElement).disabled).toBe(true);
    const warning = screen.getByText(
      'Clearing role targeting can expand who receives this announcement. Review the remaining audience before updating.'
    );
    expect(warning.id).toBe('announcement-role-clear-warning');
    expect(clearRoleCheckbox.getAttribute('aria-describedby')).toBe(
      'announcement-role-clear-warning'
    );

    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));
    expect(graphState.client.request).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole('dialog', { name: 'Review Announcement Audience Change' })
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));
    await waitFor(() =>
      expect(updateInput()).toMatchObject({
        targetRoleCode: null,
        clearRoleAudience: true,
      })
    );
  });

  it('retains the role and confirms the before and after scope before adding a department', async () => {
    const user = userEvent.setup();
    renderPage();
    await openStoredRoleAnnouncement(user);

    await user.selectOptions(screen.getByRole('combobox'), 'department-engineering');
    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));

    expect(graphState.client.request).toHaveBeenCalledTimes(1);
    const confirmationDialog = await screen.findByRole('dialog', {
      name: 'Review Announcement Audience Change',
    });
    expect(confirmationDialog.textContent).toContain(
      'Original scope: Role: HR_ADMIN; Department: all departments; Location: all locations.'
    );
    expect(confirmationDialog.textContent).toContain(
      'Proposed scope: Role: HR_ADMIN; Department: department-engineering; Location: all locations.'
    );

    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));
    await waitFor(() =>
      expect(updateInput()).toMatchObject({
        targetRoleCode: 'HR_ADMIN',
        clearRoleAudience: false,
        targetDepartmentId: 'department-engineering',
      })
    );
  });
});

describe('AdminNotificationsPage audience-change safeguards', () => {
  it('retains the role and waits for confirmation before adding a location', async () => {
    const user = userEvent.setup();
    renderPage();
    await openStoredRoleAnnouncement(user);

    await user.type(
      screen.getByRole('textbox', { name: 'Location ID (Optional UUID)' }),
      'location-london'
    );
    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));

    expect(graphState.client.request).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole('dialog', { name: 'Review Announcement Audience Change' })
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));
    await waitFor(() =>
      expect(updateInput()).toMatchObject({
        targetRoleCode: 'HR_ADMIN',
        clearRoleAudience: false,
        targetLocationId: 'location-london',
      })
    );
  });

  it('fails closed when the edited announcement is no longer available', async () => {
    const user = userEvent.setup();
    const view = renderPage();
    await openStoredRoleAnnouncement(user);

    const refreshedClient = {
      request: vi.fn().mockResolvedValue({ ...consoleData, adminAnnouncements: [] }),
    };
    graphState.client = refreshedClient;
    view.rerender(
      <DialogProvider>
        <AdminNotificationsPage />
      </DialogProvider>
    );
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull());

    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));

    expect(refreshedClient.request).toHaveBeenCalledTimes(1);
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert.textContent).toBe(
      'This announcement is no longer available. Review the current announcements and start the edit again.'
    );
    expect(screen.getByText('New announcement (HR)')).toBeTruthy();
  });

  it('cancels edit by clearing explicit role clearing and restoring create-mode defaults', async () => {
    const user = userEvent.setup();
    renderPage();
    await openStoredRoleAnnouncement(user);

    await user.click(screen.getByRole('checkbox', { name: 'Clear role targeting' }));
    await user.click(screen.getByRole('button', { name: 'Cancel edit' }));

    expect(screen.queryByRole('checkbox', { name: 'Clear role targeting' })).toBeNull();
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Target Role Code' }).value).toBe(
      ''
    );
    expect(announcementTitleInput().value).toBe('');
  });
});
