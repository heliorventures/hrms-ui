// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/require-await, import/no-named-as-default */

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PrejoiningFormPage from './PrejoiningFormPage';
import { PrejoiningClientError, type PrejoiningPublicClient, type PrejoiningForm } from './types';

const editableForm = (overrides: Partial<PrejoiningForm> = {}): PrejoiningForm => ({
  status: 'DRAFT',
  revision: 3,
  expiresAt: '2026-09-10T10:00:00Z',
  config: {
    expiryHours: 48,
    fields: [
      { key: 'firstName', label: 'First name', required: true },
      { key: 'email', label: 'Personal email', required: true },
      { key: 'dateOfBirth', label: 'Date of birth', required: false },
    ],
    documents: [
      { id: 'identity', documentTypeId: 'identity-type', label: 'Identity proof', required: true },
    ],
  },
  answers: {},
  documents: [],
  feedback: null,
  ...overrides,
});

const clientFor = (form: PrejoiningForm): PrejoiningPublicClient => ({
  getForm: vi.fn().mockResolvedValue(form),
  saveDraft: vi.fn().mockResolvedValue(form),
  submit: vi
    .fn()
    .mockResolvedValue({ ...form, status: 'SUBMITTED', submittedAt: '2026-09-08T12:00:00Z' }),
  uploadDocument: vi.fn().mockResolvedValue(form),
  deleteDocument: vi.fn().mockResolvedValue(form),
  downloadDocument: vi.fn(),
});

afterEach(() => {
  cleanup();
  window.location.hash = '';
  vi.restoreAllMocks();
});

describe('PrejoiningFormPage', () => {
  it('requires a private fragment token before contacting the API', async () => {
    const client = clientFor(editableForm());
    render(<PrejoiningFormPage client={client} />);

    expect(await screen.findByRole('heading', { name: 'This link is incomplete' })).toBeTruthy();
    expect(client.getForm).not.toHaveBeenCalled();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('loads the configured fields and validates required answers and documents', async () => {
    window.location.hash = '#token=private-secret';
    const client = clientFor(editableForm());
    const user = userEvent.setup();
    render(<PrejoiningFormPage client={client} />);

    expect(
      await screen.findByRole('heading', { name: 'Complete your pre-joining details' })
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Submit details' }));

    expect(await screen.findByText('First name is required.')).toBeTruthy();
    expect(screen.getByText('Personal email is required.')).toBeTruthy();
    expect(screen.getByText('Identity proof is required.')).toBeTruthy();
    expect(client.submit).not.toHaveBeenCalled();
  });

  it('submits the current revision once and locks the completed form', async () => {
    window.location.hash = '#token=private-secret';
    const form = editableForm({
      documents: [
        {
          id: 'document-1',
          requirementId: 'identity',
          filename: 'identity.pdf',
          sizeBytes: 20,
          mimeType: 'application/pdf',
        },
      ],
    });
    const client = clientFor(form);
    const user = userEvent.setup();
    render(<PrejoiningFormPage client={client} />);

    await user.type(await screen.findByRole('textbox', { name: /First name/ }), 'Ada');
    await user.type(screen.getByRole('textbox', { name: /Personal email/ }), 'ada@example.com');
    await user.dblClick(screen.getByRole('button', { name: 'Submit details' }));

    await waitFor(() => expect(client.submit).toHaveBeenCalledTimes(1));
    expect(client.submit).toHaveBeenCalledWith(
      'private-secret',
      {
        revision: 3,
        answers: { firstName: 'Ada', email: 'ada@example.com' },
      },
      expect.any(AbortSignal)
    );
    expect(await screen.findByRole('heading', { name: 'Details submitted' })).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: /First name/ })).toBeNull();
  });

  it('shows correction feedback and permits changes', async () => {
    window.location.hash = '#token=private-secret';
    const client = clientFor(
      editableForm({
        status: 'CHANGES_REQUESTED',
        answers: { firstName: 'Ada', email: 'ada@example.com' },
        feedback: 'Use your name as shown on your passport.',
      })
    );
    render(<PrejoiningFormPage client={client} />);

    expect(await screen.findByRole('heading', { name: 'Changes requested' })).toBeTruthy();
    expect(screen.getByText('Use your name as shown on your passport.')).toBeTruthy();
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: /First name/ }).value).toBe('Ada');
  });

  it('presents expired access without leaking a server message', async () => {
    window.location.hash = '#token=expired-secret';
    const client = clientFor(editableForm());
    vi.mocked(client.getForm).mockRejectedValue({ kind: 'expired', message: 'database detail' });
    render(<PrejoiningFormPage client={client} />);

    expect(await screen.findByRole('heading', { name: 'This link is unavailable' })).toBeTruthy();
    expect(screen.queryByText('database detail')).toBeNull();
  });

  it('ignores a load response after unmount', async () => {
    window.location.hash = '#token=private-secret';
    let resolveForm: ((value: PrejoiningForm) => void) | undefined;
    const client = clientFor(editableForm());
    vi.mocked(client.getForm).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveForm = resolve;
        })
    );
    const view = render(<PrejoiningFormPage client={client} />);
    view.unmount();

    await act(async () => resolveForm?.(editableForm()));
    expect(document.body.textContent).toBe('');
  });
});

describe('PrejoiningFormPage request ownership', () => {
  it('changes token ownership on native hash navigation', async () => {
    window.location.hash = '#token=first-secret';
    const client = clientFor(editableForm());
    render(<PrejoiningFormPage client={client} />);
    await screen.findByRole('textbox', { name: /First name/ });

    window.location.hash = '#token=second-secret';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() =>
      expect(client.getForm).toHaveBeenCalledWith('second-secret', expect.any(AbortSignal))
    );
  });

  it('locks every form mutation while a document upload is pending', async () => {
    window.location.hash = '#token=private-secret';
    let finishUpload: ((form: PrejoiningForm) => void) | undefined;
    const client = clientFor(editableForm());
    vi.mocked(client.uploadDocument).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishUpload = resolve;
        })
    );
    const user = userEvent.setup();
    render(<PrejoiningFormPage client={client} />);
    const firstName = await screen.findByRole<HTMLInputElement>('textbox', { name: /First name/ });
    await user.upload(
      screen.getByLabelText('Identity proof file'),
      new File(['id'], 'id.pdf', { type: 'application/pdf' })
    );

    expect(firstName.disabled).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save draft' }).disabled).toBe(
      true
    );
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(client.saveDraft).not.toHaveBeenCalled();
    await act(async () => finishUpload?.(editableForm({ revision: 4 })));
  });

  it('refreshes a stale document revision and preserves unsaved answers', async () => {
    window.location.hash = '#token=private-secret';
    const client = clientFor(editableForm());
    vi.mocked(client.getForm)
      .mockResolvedValueOnce(editableForm())
      .mockResolvedValueOnce(editableForm({ revision: 4 }));
    vi.mocked(client.uploadDocument).mockRejectedValueOnce(
      new PrejoiningClientError('stale', 'stale')
    );
    const user = userEvent.setup();
    render(<PrejoiningFormPage client={client} />);
    const firstName = await screen.findByRole<HTMLInputElement>('textbox', { name: /First name/ });
    await user.type(firstName, 'Ada');
    await user.upload(
      screen.getByLabelText('Identity proof file'),
      new File(['id'], 'id.pdf', { type: 'application/pdf' })
    );

    expect(await screen.findByText(/refreshed it and kept your unsaved answers/i)).toBeTruthy();
    expect(firstName.value).toBe('Ada');
    expect(client.getForm).toHaveBeenCalledTimes(2);
  });

  it('shows trusted document size validation returned by the API', async () => {
    window.location.hash = '#token=private-secret';
    const client = clientFor(editableForm());
    vi.mocked(client.uploadDocument).mockRejectedValueOnce(
      new PrejoiningClientError('too-large', 'Document exceeds the 10 MiB limit.')
    );
    const user = userEvent.setup();
    render(<PrejoiningFormPage client={client} />);
    await screen.findByRole('textbox', { name: /First name/ });

    await user.upload(
      screen.getByLabelText('Identity proof file'),
      new File(['id'], 'id.pdf', { type: 'application/pdf' })
    );

    expect(await screen.findByText('Document exceeds the 10 MiB limit.')).toBeTruthy();
  });

  it('refreshes an invalid state response and preserves unsaved answers', async () => {
    window.location.hash = '#token=private-secret';
    const client = clientFor(editableForm());
    vi.mocked(client.getForm)
      .mockResolvedValueOnce(editableForm())
      .mockResolvedValueOnce(editableForm({ status: 'SUBMITTED', revision: 4 }));
    vi.mocked(client.saveDraft).mockRejectedValueOnce(
      new PrejoiningClientError('invalid-state', 'This form is no longer editable.')
    );
    const user = userEvent.setup();
    render(<PrejoiningFormPage client={client} />);
    await user.type(await screen.findByRole('textbox', { name: /First name/ }), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(await screen.findByRole('heading', { name: 'Details submitted' })).toBeTruthy();
    expect(client.getForm).toHaveBeenCalledTimes(2);
  });
});
