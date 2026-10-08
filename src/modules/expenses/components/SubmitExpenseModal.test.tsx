// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SubmitExpenseModal from './SubmitExpenseModal';

const state = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    tenantId: 'tenant-1',
    user: { id: 'user-1' },
    clientSession: { employeeId: 'employee-1', permissions: [], permissionScopes: {} },
  }),
}));

const renderForm = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
  render(
    <SubmitExpenseModal
      categories={[{ id: 'category-1', name: 'Meals', code: 'MEALS' }]}
      isOpen
      loading={false}
      submissionHints={null}
      submitting={false}
      travelRequests={[]}
      onCategoryChange={vi.fn()}
      onClose={vi.fn()}
      onSubmit={onSubmit}
    />
  );
  fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'category-1' } });
  fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Client lunch' } });
  fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '100.00' } });
  return onSubmit;
};

beforeEach(() => {
  state.request.mockReset().mockResolvedValue({ uploadTenantFile: { id: 'file-1' } });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('expense supporting file', () => {
  it('requires a receipt even without policy hints', () => {
    const onSubmit = renderForm();
    const file = screen.getByLabelText<HTMLInputElement>(/Receipt/);
    expect(file.required).toBe(true);
    const form = document.getElementById('submit-expense-form');
    if (!form) throw new Error('Expense form is missing');
    fireEvent.submit(form);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(state.request).not.toHaveBeenCalled();
  });

  it('reuses the uploaded file when claim submission fails', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Try again'))
      .mockResolvedValueOnce(undefined);
    renderForm(onSubmit);
    fireEvent.change(screen.getByLabelText(/Receipt/), {
      target: { files: [new File(['%PDF-1.4'], 'receipt.pdf', { type: 'application/pdf' })] },
    });
    const form = document.getElementById('submit-expense-form');
    expect(form).toBeTruthy();
    if (!form) throw new Error('Expense form is missing');
    fireEvent.submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await screen.findByText(/Try again/);
    fireEvent.submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(state.request).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[1]?.[0]).toMatchObject({
      receiptFileStorageId: 'file-1',
      title: 'Client lunch',
    });
  });
});
