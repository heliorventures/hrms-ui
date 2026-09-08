// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DialogProvider } from '../../contexts/DialogContext';

import AdminNotificationsPage from './AdminNotificationsPage';

const graphState = vi.hoisted(() => ({
  client: {
    request: vi.fn<[unknown, unknown?], Promise<unknown>>(),
  },
}));

const videoState = vi.hoisted(() => ({
  ownerKey: 'tenant-one|session-one',
  prepareVideo: vi.fn<[File | null], Promise<string | null>>(),
  resetVideo: vi.fn(),
  cancelUpload: vi.fn(),
}));

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

vi.mock('../notifications/useAnnouncementVideoUpload', () => ({
  useAnnouncementVideoUpload: () => ({
    prepareVideo: videoState.prepareVideo,
    resetVideo: videoState.resetVideo,
    cancelUpload: videoState.cancelUpload,
    progress: null,
  }),
}));

vi.mock('../notifications/useNotificationOwnerKey', () => ({
  useNotificationOwnerKey: () => videoState.ownerKey,
}));

const consoleData = {
  notificationAutomationSettings: {
    birthdayEnabled: true,
    workAnniversaryEnabled: true,
    companySharingEnabled: true,
    deliveryLocalTime: '09:00:00',
    birthdayTitleTemplate: 'Happy birthday, {employee_name}!',
    birthdayMessageTemplate: 'Wishing {employee_name} a wonderful birthday.',
    anniversaryTitleTemplate: 'Work anniversary: {employee_name}',
    anniversaryMessageTemplate:
      "Celebrating {employee_name}'s {service_years}-year work anniversary.",
  },
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
      hasVideoAttachment: true,
      videoLink: null,
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

const createInput = (): Record<string, unknown> => {
  const createCall = graphState.client.request.mock.calls.find(([, variables]) => {
    if (!variables || typeof variables !== 'object' || !('input' in variables)) return false;
    const { input } = variables;
    return input !== null && typeof input === 'object' && !('id' in input) && 'title' in input;
  });
  const variables = createCall?.[1];
  if (!variables || typeof variables !== 'object' || !('input' in variables)) {
    throw new Error('Expected the announcement create request.');
  }
  return variables.input as Record<string, unknown>;
};

const announcementTitleInput = () =>
  screen.getAllByRole('textbox', { name: 'Title' })[0] as HTMLInputElement;

beforeEach(() => {
  videoState.ownerKey = 'tenant-one|session-one';
  videoState.prepareVideo.mockReset().mockResolvedValue('video-stage-1');
  videoState.resetVideo.mockReset();
  videoState.cancelUpload.mockReset();
  graphState.client = {
    request: vi.fn<[unknown, unknown?], Promise<unknown>>().mockImplementation((document) => {
      if (typeof document === 'string' && document.includes('SaveNotificationAutomationSettings')) {
        return Promise.resolve({
          saveNotificationAutomationSettings: consoleData.notificationAutomationSettings,
        });
      }
      return Promise.resolve(consoleData);
    }),
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

describe('AdminNotificationsPage announcement video editing', () => {
  it.each([
    ['No video', null, null],
    ['Video link', 'https://video.example/policy', null],
    ['Upload video', null, 'video-stage-1'],
  ] as const)(
    'does not send update-only removeVideo when creating with %s',
    async (mode, expectedLink, expectedStageId) => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('New announcement (HR)');
      await user.type(announcementTitleInput(), 'New policy');
      if (mode !== 'No video') await user.click(screen.getByRole('radio', { name: mode }));
      if (mode === 'Video link') {
        await user.type(screen.getByRole('textbox', { name: 'Video URL' }), expectedLink);
      }
      if (mode === 'Upload video') {
        await user.upload(
          screen.getByLabelText('Video file'),
          new File(['video'], 'policy.mp4', { type: 'video/mp4' })
        );
      }

      await user.click(screen.getByRole('button', { name: 'Create Announcement' }));

      await waitFor(() => expect(createInput()).not.toHaveProperty('removeVideo'));
      expect(createInput()).toMatchObject({
        videoLink: expectedLink,
        videoUploadStageId: expectedStageId,
      });
    }
  );

  it('keeps the existing video without sending video replacement fields', async () => {
    const user = userEvent.setup();
    renderPage();
    await openStoredRoleAnnouncement(user);

    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: 'Keep current video' }).checked
    ).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));

    await waitFor(() => expect(updateInput()).not.toHaveProperty('removeVideo'));
    expect(updateInput()).not.toHaveProperty('videoLink');
    expect(updateInput()).not.toHaveProperty('videoUploadStageId');
    expect(videoState.prepareVideo).not.toHaveBeenCalled();
  });

  it('explicitly removes an existing video', async () => {
    const user = userEvent.setup();
    renderPage();
    await openStoredRoleAnnouncement(user);
    await user.click(screen.getByRole('radio', { name: 'No video' }));
    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));

    await waitFor(() => expect(updateInput()).toMatchObject({ removeVideo: true }));
  });

  it('replaces an existing video with a validated link', async () => {
    const user = userEvent.setup();
    renderPage();
    await openStoredRoleAnnouncement(user);
    await user.click(screen.getByRole('radio', { name: 'Video link' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Video URL' }),
      'https://video.example/policy'
    );
    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));

    await waitFor(() =>
      expect(updateInput()).toMatchObject({
        videoLink: 'https://video.example/policy',
        videoUploadStageId: null,
        removeVideo: false,
      })
    );
  });

  it('does not stage an upload until an audience change is confirmed', async () => {
    const user = userEvent.setup();
    renderPage();
    await openStoredRoleAnnouncement(user);
    await user.selectOptions(screen.getByRole('combobox'), 'department-engineering');
    await user.click(screen.getByRole('radio', { name: 'Upload video' }));
    const video = new File(['video'], 'policy.mp4', { type: 'video/mp4' });
    await user.upload(screen.getByLabelText('Video file'), video);

    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));
    await screen.findByRole('dialog', { name: 'Review Announcement Audience Change' });
    expect(videoState.prepareVideo).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Update Announcement' }));
    await waitFor(() => expect(videoState.prepareVideo).toHaveBeenCalledWith(video));
    await waitFor(() =>
      expect(updateInput()).toMatchObject({
        videoUploadStageId: 'video-stage-1',
        removeVideo: false,
      })
    );
  });
});

describe('AdminNotificationsPage automated employee events', () => {
  it('loads settings and saves the complete validated configuration', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Automated Employee Events')).toBeTruthy();
    const birthdayEnabled = screen.getByRole<HTMLInputElement>('checkbox', {
      name: 'Enable birthday notifications',
    });
    expect(birthdayEnabled.checked).toBe(true);
    await user.click(birthdayEnabled);
    await user.click(screen.getByRole('button', { name: 'Save Automated Events' }));

    await waitFor(() => {
      const saveCall = graphState.client.request.mock.calls.find(
        ([document]) =>
          typeof document === 'string' && document.includes('SaveNotificationAutomationSettings')
      );
      expect(saveCall?.[1]).toEqual({
        input: {
          ...consoleData.notificationAutomationSettings,
          birthdayEnabled: false,
        },
      });
    });
  });

  it('rejects unsafe template tokens before sending a mutation', async () => {
    const user = userEvent.setup();
    renderPage();

    const birthdayMessage = await screen.findByRole('textbox', {
      name: 'Birthday message template',
    });
    fireEvent.change(birthdayMessage, {
      target: { value: 'Happy {employee_name}, age {age}' },
    });
    await user.click(screen.getByRole('button', { name: 'Save Automated Events' }));

    expect((await screen.findByRole('alert')).textContent).toContain('unsupported token');
    expect(
      graphState.client.request.mock.calls.some(
        ([document]) =>
          typeof document === 'string' && document.includes('SaveNotificationAutomationSettings')
      )
    ).toBe(false);
  });
});
