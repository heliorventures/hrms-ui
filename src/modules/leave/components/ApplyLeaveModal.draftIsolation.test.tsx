// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import ApplyLeaveModal from './ApplyLeaveModal';

const state = vi.hoisted(() => ({
  client: { request: vi.fn() },
  tenantId: 'tenant-a',
  user: { id: 'user-a' },
  upload: vi.fn(),
}));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ tenantId: state.tenantId, user: state.user, clientSession: null }),
}));
vi.mock('../../../utils/tenantFileUpload', () => ({
  uploadTenantFile: state.upload,
  validateTenantUploadFile: () => null,
}));
beforeEach(() => {
  state.client = { request: vi.fn() };
  state.tenantId = 'tenant-a';
  state.user = { id: 'user-a' };
  state.upload.mockReset();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const props = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmitted: vi.fn(),
  leavePolicies: [],
  upcomingHolidays: [],
  leaveBalances: [],
  leaveTypes: [
    {
      id: 'medical',
      name: 'Medical',
      code: 'ML',
      isPaid: false,
      requiresDocument: true,
      halfDayAllowed: true,
    },
  ],
};
function fillPrivateDraft() {
  fireEvent.change(screen.getByLabelText('Leave type'), { target: { value: 'medical' } });
  fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-09-14' } });
  fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-09-15' } });
  fireEvent.change(screen.getByLabelText('Reason'), {
    target: { value: 'Private medical diagnosis' },
  });
  fireEvent.change(screen.getByLabelText('Supporting document'), {
    target: { files: [new File(['private evidence'], 'private.pdf', { type: 'application/pdf' })] },
  });
}
function submitForm() {
  const form = document.getElementById('apply-leave-form');
  if (!(form instanceof HTMLFormElement)) throw new Error('Missing leave form');
  fireEvent.submit(form);
}
function expectEmptyDraft() {
  expect(screen.getByLabelText<HTMLTextAreaElement>('Reason').value).toBe('');
  expect(screen.getByLabelText<HTMLSelectElement>('Leave type').value).toBe('');
  expect(screen.getByLabelText<HTMLInputElement>('From').value).toBe('');
  expect(screen.getByLabelText<HTMLInputElement>('To').value).toBe('');
  expect(screen.queryByLabelText('Supporting document')).toBeNull();
  expect(screen.queryByText('Discard this leave request?')).toBeNull();
  submitForm();
  expect(state.client.request).not.toHaveBeenCalled();
  expect(state.upload).not.toHaveBeenCalled();
}
it.each(['client', 'tenant', 'user'] as const)(
  'clears private draft for %s replacement and A-B-A return',
  (kind) => {
    const originalClient = state.client;
    const view = render(<ApplyLeaveModal {...props} />);
    fillPrivateDraft();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    if (kind === 'client') state.client = { request: vi.fn() };
    if (kind === 'tenant') state.tenantId = 'tenant-b';
    if (kind === 'user') state.user = { id: 'user-b' };
    view.rerender(<ApplyLeaveModal {...props} />);
    expectEmptyDraft();
    state.client = originalClient;
    state.tenantId = 'tenant-a';
    state.user = { id: 'user-a' };
    view.rerender(<ApplyLeaveModal {...props} />);
    expectEmptyDraft();
  }
);
it('does not promote an old upload into a leave mutation after identity replacement', async () => {
  let resolveUpload!: (id: string) => void;
  state.upload.mockReturnValue(
    new Promise<string>((resolve) => {
      resolveUpload = resolve;
    })
  );
  const originalClient = state.client;
  const view = render(<ApplyLeaveModal {...props} />);
  fillPrivateDraft();
  submitForm();
  expect(state.upload).toHaveBeenCalledOnce();
  state.user = { id: 'user-b' };
  view.rerender(<ApplyLeaveModal {...props} />);
  state.user = { id: 'user-a' };
  view.rerender(<ApplyLeaveModal {...props} />);
  await act(async () => {
    resolveUpload('private-file-a');
    await Promise.resolve();
  });
  expect(originalClient.request).not.toHaveBeenCalled();
  expect(screen.getByLabelText<HTMLTextAreaElement>('Reason').value).toBe('');
});

it('does not focus a new dialog from a queued previous-dialog validation callback', () => {
  let queued: FrameRequestCallback | undefined;
  const animation = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    queued = callback;
    return 1;
  });
  const view = render(<ApplyLeaveModal {...props} />);
  submitForm();
  const staleCallback = queued;
  view.rerender(<ApplyLeaveModal {...props} isOpen={false} />);
  view.rerender(<ApplyLeaveModal {...props} />);
  const focus = vi.spyOn(screen.getByLabelText('Leave type'), 'focus');
  act(() => staleCallback?.(0));
  expect(focus).not.toHaveBeenCalled();
  animation.mockRestore();
});

it('preserves a private draft and file across an ordinary same-owner rerender', () => {
  const view = render(<ApplyLeaveModal {...props} />);
  fillPrivateDraft();
  view.rerender(<ApplyLeaveModal {...props} upcomingHolidaysLoading={false} />);
  expect(screen.getByLabelText<HTMLTextAreaElement>('Reason').value).toBe(
    'Private medical diagnosis'
  );
  expect(screen.getByLabelText<HTMLInputElement>('From').value).toBe('2026-09-14');
  expect(screen.getByLabelText<HTMLInputElement>('To').value).toBe('2026-09-15');
  expect(screen.getByLabelText<HTMLInputElement>('Supporting document').files?.[0].name).toBe(
    'private.pdf'
  );
});
