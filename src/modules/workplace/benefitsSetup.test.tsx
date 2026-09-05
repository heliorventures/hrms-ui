// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SetupModal, SaveBenefitType } from './benefitsSetup';
const request = vi.hoisted(() => vi.fn());
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => ({ request }) }));
vi.mock('../../components/common/Modal', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
afterEach(() => {
  cleanup();
  request.mockReset();
});
describe('benefit setup save', () => {
  it('blocks two submissions dispatched before React renders busy state', () => {
    request.mockReturnValue(new Promise(() => {}));
    const { container } = render(
      <SetupModal
        editor={{
          title: 'Create type',
          mutation: SaveBenefitType,
          fields: [],
          values: { name: 'Medical' },
        }}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    const form = container.querySelector('form')!;
    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(request).toHaveBeenCalledOnce();
  });
  it('rejects whitespace-only required fields with a field-specific message', async () => {
    const { container } = render(
      <SetupModal
        editor={{
          title: 'Create type',
          mutation: SaveBenefitType,
          fields: [{ name: 'name', label: 'Name', required: true }],
          values: { name: '   ' },
        }}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    fireEvent.submit(container.querySelector('form')!);
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Enter name.');
    expect(request).not.toHaveBeenCalled();
  });
  it('retries refresh without submitting the successful creation twice', async () => {
    request.mockResolvedValue({ saveBenefitType: { id: 'new-type' } });
    const refresh = vi
      .fn()
      .mockRejectedValueOnce(new Error('Refresh failed'))
      .mockResolvedValue(undefined);
    const close = vi.fn();
    render(
      <SetupModal
        editor={{
          title: 'Create type',
          mutation: SaveBenefitType,
          fields: [],
          values: { name: '  Medical  ', code: 'MED', category: '' },
        }}
        onClose={close}
        onSaved={refresh}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('button', { name: 'Retry refresh' });
    expect(request).toHaveBeenCalledWith(SaveBenefitType, {
      id: null,
      input: { name: 'Medical', code: 'MED', category: null },
    });
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry refresh' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(request).toHaveBeenCalledOnce();
  });
});
