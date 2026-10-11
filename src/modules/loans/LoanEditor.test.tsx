// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SubmitLoanRequestDocument } from '../../api/loans/graphql';

import LoanEditor from './LoanEditor';
import type { LoanEditorDefinition } from './loanForm';

const request = vi.hoisted(() => vi.fn<unknown[], Promise<unknown>>());
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => ({ request }) }));
vi.mock('./LoanProjectionSummary', () => ({ default: () => null }));
const definition: LoanEditorDefinition = {
  title: 'Record loan payment',
  description: 'Review a confirmed external payment.',
  fields: [{ key: 'amount', label: 'Amount', type: 'decimal' }],
  values: { amount: '1000' },
  document: SubmitLoanRequestDocument,
  version: 7,
  build: (values) => ({ amount: values.amount }),
};
afterEach(() => {
  cleanup();
  request.mockReset();
});
const confirm = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Review values' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm and save' }));
};
describe('Loan command confirmation and retries', () => {
  it('binds a financial confirmation to the exact server preview reviewed by HR', async () => {
    request.mockResolvedValue({});
    const review = { reviewFingerprint: 'a'.repeat(64), correctedPrincipal: '900' };
    const build = vi.fn(() => ({ reviewFingerprint: review.reviewFingerprint }));
    render(
      <LoanEditor
        definition={{
          ...definition,
          values: { amount: '1000' },
          preview: () => Promise.resolve(review),
          build,
        }}
        onClose={vi.fn()}
        onSaved={vi.fn(async () => {})}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Review values' }));
    await screen.findByRole('button', { name: 'Confirm and save' });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and save' }));
    await waitFor(() => expect(build).toHaveBeenCalledWith({ amount: '1000' }, review));
  });
  it('keeps the same idempotency key when an uncertain request is retried', async () => {
    request.mockRejectedValueOnce(new Error('Connection lost')).mockResolvedValueOnce({});
    const close = vi.fn();
    render(<LoanEditor definition={definition} onClose={close} onSaved={vi.fn(async () => {})} />);
    confirm();
    await screen.findByRole('button', { name: 'Confirm and save' });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and save' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(request).toHaveBeenCalledTimes(2);
    const [first, second] = request.mock.calls;
    expect(first[1]).toEqual(second[1]);
    expect(first[1]).toMatchObject({ input: { meta: { expectedVersion: 7 } } });
  });
  it('retries refresh without repeating a recorded financial command', async () => {
    request.mockResolvedValue({});
    const refresh = vi
      .fn()
      .mockRejectedValueOnce(new Error('Refresh failed'))
      .mockResolvedValueOnce(undefined);
    const close = vi.fn();
    render(<LoanEditor definition={definition} onClose={close} onSaved={refresh} />);
    confirm();
    await screen.findByRole('button', { name: 'Refresh records' });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh records' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(request).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledTimes(2);
  });
  it('requires plain decimal values before any command is sent', async () => {
    render(
      <LoanEditor definition={definition} onClose={vi.fn()} onSaved={vi.fn(async () => {})} />
    );
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1e3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review values' }));
    await screen.findByRole('alert');
    expect(request).not.toHaveBeenCalled();
  });
});
