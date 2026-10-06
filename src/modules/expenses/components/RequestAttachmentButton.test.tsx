// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import RequestAttachmentButton from './RequestAttachmentButton';

const state = vi.hoisted(() => ({ request: vi.fn(), userId: 'user-1' }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ tenantId: 'tenant-1', user: { id: state.userId } }),
}));

beforeEach(() => {
  state.userId = 'user-1';
  state.request.mockReset().mockResolvedValue({
    attachment: {
      fileName: 'receipt.pdf',
      mimeType: 'application/pdf',
      contentBase64: 'JVBERg==',
    },
  });
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn().mockReturnValue('blob:receipt'),
    revokeObjectURL: vi.fn(),
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('retrieves evidence using the parent request ID and revokes the download URL', async () => {
  render(<RequestAttachmentButton kind="expense" requestId="expense-1" hasFile />);
  fireEvent.click(screen.getByRole('button', { name: 'Download file' }));
  await waitFor(() => expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1));
  expect(state.request).toHaveBeenCalledWith(
    expect.stringContaining('expenseAttachment(expenseId: $id)'),
    { id: 'expense-1' }
  );
  await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:receipt'));
});

it('explains historical missing evidence without requesting bytes', () => {
  render(<RequestAttachmentButton kind="travel" requestId="travel-1" hasFile={false} />);
  expect(screen.getByText('No file on historical request')).toBeTruthy();
  expect(state.request).not.toHaveBeenCalled();
});

it('ignores a response after the signed-in user changes', async () => {
  let complete: ((data: unknown) => void) | undefined;
  state.request.mockReturnValue(
    new Promise((resolve) => {
      complete = resolve;
    })
  );
  const view = render(<RequestAttachmentButton kind="travel" requestId="travel-1" hasFile />);
  fireEvent.click(screen.getByRole('button', { name: 'Download file' }));
  state.userId = 'user-2';
  view.rerender(<RequestAttachmentButton kind="travel" requestId="travel-1" hasFile />);
  complete?.({
    attachment: { fileName: 'receipt.pdf', mimeType: 'application/pdf', contentBase64: 'JVBERg==' },
  });
  await waitFor(() =>
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Download file' }).disabled).toBe(
      false
    )
  );
  expect(URL.createObjectURL).not.toHaveBeenCalled();
});
