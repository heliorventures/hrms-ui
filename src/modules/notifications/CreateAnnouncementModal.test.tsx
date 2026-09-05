// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrgDepartmentsDocument } from '../../api/graphql/graphql';
import type { ClientPersona, ParsedClientSession } from '../../auth/clientSession';

import CreateAnnouncementModal from './CreateAnnouncementModal';
import { CreateAnnouncementSafeDocument } from './notificationQueries';

type GraphRequestArguments = [document: unknown, variables?: Record<string, unknown>];
type GraphRequestResult = Promise<unknown>;

const graphState = vi.hoisted(() => ({
  client: { request: vi.fn<GraphRequestArguments, GraphRequestResult>() },
}));

const authState = vi.hoisted(() => ({
  session: null as ParsedClientSession | null,
}));

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: () => false,
    clientSession: authState.session,
  }),
}));

const sessionFor = (
  persona: ClientPersona,
  permissions: ReadonlySet<string> = new Set(['notification:manage'])
): ParsedClientSession => ({
  jwtRoles: [],
  permissions,
  permissionScopes: permissions.has('notification:manage')
    ? { 'notification:manage': 'ALL' }
    : {},
  resourceScopes: {},
  persona,
  mustChangePassword: false,
});

const renderModal = (overrides: Partial<ComponentProps<typeof CreateAnnouncementModal>> = {}) =>
  render(<CreateAnnouncementModal isOpen onClose={vi.fn()} onCreated={vi.fn()} {...overrides} />);

const createRequests = (client = graphState.client) =>
  client.request.mock.calls.filter(([document]) => document === CreateAnnouncementSafeDocument);

const getPublishButton = () => screen.getByRole('button', { name: 'Publish Announcement' });

const getComposerForm = () => {
  const form = getPublishButton().closest('form');
  if (!form) throw new Error('Announcement composer form was not rendered.');
  return form;
};

beforeEach(() => {
  graphState.client = { request: vi.fn<GraphRequestArguments, GraphRequestResult>() };
  authState.session = sessionFor('HR');
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

describe('CreateAnnouncementModal audience loading', () => {
  it('blocks HR publication when department options fail to load', async () => {
    graphState.client.request.mockImplementation((document) => {
      if (document === OrgDepartmentsDocument) {
        return Promise.reject(new Error('Failed to fetch'));
      }
      return Promise.resolve({});
    });

    renderModal();

    expect(
      await screen.findByText(
        'Audience options could not be loaded. Your announcement has not been published.'
      )
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(getPublishButton().hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('combobox', { name: 'Department' }).hasAttribute('disabled')).toBe(
      true
    );
    fireEvent.submit(getComposerForm());
    expect(createRequests()).toHaveLength(0);
  });

  it('retains entered announcement values while audience options retry', async () => {
    const user = userEventLibrary.setup();
    graphState.client.request.mockRejectedValueOnce(new Error('Failed to fetch'));
    graphState.client.request.mockResolvedValueOnce({
      departments: [{ id: 'department-engineering', name: 'Engineering' }],
    });

    renderModal();

    await screen.findByText(
      'Audience options could not be loaded. Your announcement has not been published.'
    );
    expect(screen.getByLabelText('Publish at').hasAttribute('disabled')).toBe(false);
    expect(screen.getByLabelText('Expires at').hasAttribute('disabled')).toBe(false);
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Planned maintenance');
    await user.type(
      screen.getByRole('textbox', { name: 'Description' }),
      'Service resumes at noon.'
    );
    fireEvent.change(screen.getByLabelText('Publish at'), {
      target: { value: '2026-08-25T09:30' },
    });
    fireEvent.change(screen.getByLabelText('Expires at'), {
      target: { value: '2026-08-25T17:30' },
    });
    const imageFile = new File(['image'], 'announcement.png', { type: 'image/png' });
    const documentFile = new File(['document'], 'announcement.txt', { type: 'text/plain' });
    await user.upload(screen.getByLabelText('Image'), imageFile);
    await user.upload(screen.getByLabelText('Document'), documentFile);

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Department' }).hasAttribute('disabled')).toBe(
        false
      )
    );
    expect(screen.getByDisplayValue('Planned maintenance')).toBeTruthy();
    expect(screen.getByDisplayValue('Service resumes at noon.')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-08-25T09:30')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-08-25T17:30')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Image').files?.[0]).toBe(imageFile);
    expect(screen.getByLabelText<HTMLInputElement>('Document').files?.[0]).toBe(documentFile);
    expect(screen.getByRole('option', { name: 'Engineering' })).toBeTruthy();
  });

  it('does not block employee team posts on HR-only audience lookup state', async () => {
    authState.session = sessionFor('EMPLOYEE', new Set());
    graphState.client.request.mockResolvedValue({});
    const employeeClient = graphState.client;

    renderModal();

    expect(graphState.client.request).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'Team update' },
    });
    const publishButton = screen.getByRole('button', { name: 'Publish Team Post' });
    const form = publishButton.closest('form');
    if (!form) throw new Error('Team post form was not rendered.');
    fireEvent.submit(form);

    await waitFor(() => expect(createRequests(employeeClient)).toHaveLength(1));
    const [createRequest] = createRequests(employeeClient);
    expect(createRequest[1]).toMatchObject({
      input: {
        employeePost: true,
        targetAudience: null,
        targetDepartmentId: null,
        targetLocationId: null,
        targetRoleCode: null,
        publishAt: null,
        expiresAt: null,
      },
    });
  });
});

describe('CreateAnnouncementModal audience state retention', () => {
  it('clears a validation error when the composer closes', async () => {
    const user = userEventLibrary.setup();
    graphState.client.request.mockResolvedValue({ departments: [] });

    renderModal();

    await waitFor(() => expect(getPublishButton().hasAttribute('disabled')).toBe(false));
    fireEvent.submit(getComposerForm());
    expect(await screen.findByText('Title is required.')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Title is required.')).toBeNull();
  });

  it('fails closed immediately after closing and reopening an HR composer', async () => {
    const user = userEventLibrary.setup();
    const onClose = vi.fn();
    graphState.client.request
      .mockResolvedValueOnce({
        departments: [{ id: 'department-engineering', name: 'Engineering' }],
      })
      .mockImplementationOnce(() => new Promise(() => undefined));
    const view = renderModal({ onClose });

    await screen.findByRole('option', { name: 'Engineering' });
    expect(getPublishButton().hasAttribute('disabled')).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(getPublishButton().hasAttribute('disabled')).toBe(true);

    view.rerender(<CreateAnnouncementModal isOpen={false} onClose={onClose} />);
    view.rerender(<CreateAnnouncementModal isOpen onClose={onClose} />);

    expect(getPublishButton().hasAttribute('disabled')).toBe(true);
    expect(screen.queryByRole('option', { name: 'Engineering' })).toBeNull();
  });

  it('retains HR role, department, and audience values across a failed refresh and retry', async () => {
    const user = userEventLibrary.setup();
    graphState.client.request.mockResolvedValueOnce({
      departments: [{ id: 'department-engineering', name: 'Engineering' }],
    });
    const view = renderModal();

    await screen.findByRole('option', { name: 'Engineering' });
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Department' }),
      'department-engineering'
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Target Audience (Optional)' }),
      'Engineering'
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Target Role Code (Optional, E.G. HR_ADMIN)' }),
      'HR_ADMIN'
    );

    graphState.client = {
      request: vi
        .fn<GraphRequestArguments, GraphRequestResult>()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce({
          departments: [{ id: 'department-engineering', name: 'Engineering' }],
        }),
    };
    view.rerender(<CreateAnnouncementModal isOpen onClose={vi.fn()} onCreated={vi.fn()} />);

    await screen.findByText(
      'Audience options could not be loaded. Your announcement has not been published.'
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Department' }).hasAttribute('disabled')).toBe(
        false
      )
    );
    expect(screen.getByRole<HTMLSelectElement>('combobox', { name: 'Department' }).value).toBe(
      'department-engineering'
    );
    const roleInput = screen.getByRole<HTMLInputElement>('textbox', {
      name: 'Target Role Code (Optional, E.G. HR_ADMIN)',
    });
    expect(roleInput.value).toBe('HR_ADMIN');
    await user.clear(roleInput);
    expect(
      screen.getByRole<HTMLInputElement>('textbox', { name: 'Target Audience (Optional)' }).value
    ).toBe('Engineering');
  });
});
