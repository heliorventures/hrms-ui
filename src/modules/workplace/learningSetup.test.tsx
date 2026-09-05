// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import LearningPage from './LearningPage';
import PerformancePage from './PerformancePage';

const state = vi.hoisted(() => ({ request: vi.fn(), scope: 'ALL' }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      permissions: new Set(['performance:manage', 'learning:manage']),
      permissionScopes: { 'performance:manage': state.scope, 'learning:manage': state.scope },
      resourceScopes: {},
    },
  }),
}));
afterEach(cleanup);
beforeEach(() => {
  state.scope = 'ALL';
  state.request.mockReset();
  state.request.mockResolvedValue({ reviewCycles: [], goals: [], skills: [], courses: [] });
});
it('hides setup actions for narrow permission scope', async () => {
  state.scope = 'TEAM';
  render(
    <>
      <PerformancePage />
      <LearningPage />
    </>
  );
  await screen.findByText('No Review Cycles.');
  expect(screen.queryByRole('button', { name: 'Create review cycle' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Create skill' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Create course' })).toBeNull();
});
it('creates a skill and refreshes the catalog', async () => {
  render(<LearningPage />);
  await screen.findByText('No Skills Catalog.');
  fireEvent.click(screen.getByRole('button', { name: 'Create skill' }));
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: ' Security ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(state.request).toHaveBeenCalledWith(expect.stringContaining('mutation SaveSkill'), {
      input: { id: null, name: 'Security', category: null, level: null },
    })
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(state.request.mock.calls.length).toBeGreaterThanOrEqual(3);
});
it('closes after a saved mutation even if refreshing fails, without offering a duplicate save', async () => {
  state.request
    .mockResolvedValueOnce({ skills: [], courses: [] })
    .mockResolvedValueOnce({ saveSkill: { id: 'saved' } })
    .mockRejectedValueOnce(new Error('Refresh unavailable'));
  render(<LearningPage />);
  await screen.findByText('No Skills Catalog.');
  fireEvent.click(screen.getByRole('button', { name: 'Create skill' }));
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Security' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByText(/Saved, but the list could not refresh/);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(
    state.request.mock.calls.filter(
      ([document]) => typeof document === 'string' && document.includes('mutation SaveSkill')
    )
  ).toHaveLength(1);
});
it('loads and edits catalog entries beyond the first page', async () => {
  const firstPage = Array.from({ length: 20 }, (_, index) => ({
    id: String(index),
    name: `Skill ${index}`,
    category: null,
    level: null,
  }));
  state.request
    .mockResolvedValueOnce({ skills: firstPage, courses: [] })
    .mockResolvedValue({
      skills: [{ id: 'last', name: 'Zulu', category: null, level: null }],
      courses: [],
    });
  render(<LearningPage />);
  await screen.findByText('Skill 0');
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByText('Zulu');
  expect(state.request).toHaveBeenCalledWith(expect.stringContaining('offset: $offset'), {
    offset: 20,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Edit skill Zulu' }));
  expect(screen.getByLabelText(/^Name/)).toHaveProperty('value', 'Zulu');
});
