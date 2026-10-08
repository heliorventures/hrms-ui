// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SuccessionPage from './SuccessionPage';
import SuccessionSetupModal from './SuccessionSetupModal';

const state = vi.hoisted(() => ({ scope: 'ALL', request: vi.fn() }));
vi.mock('../../hooks/useGraphClient', () => {
  const client = { request: state.request };
  return { useGraphClient: () => client };
});
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: () => true,
    clientSession: { permissionScopes: { 'succession:manage': state.scope } },
  }),
}));
vi.mock('../../components/common/Modal', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
afterEach(cleanup);
beforeEach(() => {
  state.scope = 'ALL';
  state.request.mockReset();
  state.request.mockResolvedValue({ competencies: [], talentPools: [] });
});
describe('succession setup', () => {
  it('loads later catalog pages through the server offset', async () => {
    state.request.mockImplementation((_document: unknown, variables: { offset: number }) =>
      Promise.resolve({
        competencies:
          variables.offset === 0
            ? Array.from({ length: 21 }, (_, index) => ({
                id: String(index),
                name: `Competency ${index}`,
              }))
            : [{ id: 'later', name: 'Later competency' }],
        talentPools: [],
      })
    );
    render(<SuccessionPage />);
    await screen.findByText('Competency 19');
    expect(screen.queryByText('Competency 20')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Later competency');
    expect(state.request).toHaveBeenLastCalledWith(expect.anything(), { offset: 20 });
  });

  it('hides organization setup for scoped managers', async () => {
    state.scope = 'TEAM';
    render(<SuccessionPage />);
    await screen.findByText('No Competencies In Catalog.');
    expect(screen.queryByText('Create Competency')).toBeNull();
  });
  it('saves edited talent pool without competency-only fields and prevents double submit', async () => {
    let resolve!: (value: unknown) => void;
    state.request.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    const saved = vi.fn();
    render(
      <SuccessionSetupModal
        kind="pool"
        initial={{ id: 'pool-id', name: 'Leaders', description: 'Existing' }}
        onClose={vi.fn()}
        onSaved={saved}
      />
    );
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: ' New leaders ' } });
    const save = screen.getByRole('button', { name: 'Save Talent Pool' });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(state.request).toHaveBeenCalledTimes(1);
    expect(state.request.mock.calls[0][1]).toEqual({
      input: { id: 'pool-id', name: 'New leaders', description: 'Existing' },
    });
    resolve({ saveTalentPool: { id: 'pool-id' } });
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
  });
});
