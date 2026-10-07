// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  LearningCatalogDocument,
  SaveCourseDocument,
  SaveSkillDocument,
} from '../../api/graphql/graphql';
import { graphqlDocumentSource } from '../../testUtils/graphqlDocumentSource';

import LearningPage from './LearningPage';
import PerformancePage from './PerformancePage';

const renderPage = (page: ReactElement, tab = 'skills') =>
  render(<MemoryRouter initialEntries={[`/learning?tab=${tab}`]}>{page}</MemoryRouter>);

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
  renderPage(
    <>
      <PerformancePage />
      <LearningPage />
    </>
  );
  await screen.findByText('No Skills Catalog.');
  expect(screen.queryByRole('button', { name: 'Create review cycle' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Create skill' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Create course' })).toBeNull();
});
it('creates a skill and refreshes the catalog', async () => {
  renderPage(<LearningPage />);
  await screen.findByText('No Skills Catalog.');
  fireEvent.click(screen.getByRole('button', { name: 'Create skill' }));
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: ' Security ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(state.request).toHaveBeenCalledWith(SaveSkillDocument, {
      input: { id: null, name: 'Security', category: null, level: null },
    })
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(state.request.mock.calls.length).toBeGreaterThanOrEqual(3);
});
it('creates a course with its generated mutation and typed course fields', async () => {
  renderPage(<LearningPage />, 'courses');
  await screen.findByText('No Active Courses.');
  fireEvent.click(screen.getByRole('button', { name: 'Create course' }));
  fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: ' Security training ' } });
  fireEvent.change(screen.getByLabelText('Duration (minutes)'), { target: { value: '45' } });
  fireEvent.click(screen.getByLabelText('Mandatory'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(state.request).toHaveBeenCalledWith(SaveCourseDocument, {
      input: {
        id: null,
        title: 'Security training',
        category: null,
        deliveryMode: null,
        durationMinutes: 45,
        isMandatory: true,
      },
    })
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
it('closes after a saved mutation even if refreshing fails, without offering a duplicate save', async () => {
  state.request
    .mockResolvedValueOnce({ skills: [], courses: [] })
    .mockResolvedValueOnce({ saveSkill: { id: 'saved' } })
    .mockRejectedValueOnce(new Error('Refresh unavailable'));
  renderPage(<LearningPage />);
  await screen.findByText('No Skills Catalog.');
  fireEvent.click(screen.getByRole('button', { name: 'Create skill' }));
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Security' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByText(/Saved, but the list could not refresh/);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(
    state.request.mock.calls.filter(([document]) =>
      graphqlDocumentSource(document).includes('mutation SaveSkill')
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
  state.request.mockResolvedValueOnce({ skills: firstPage, courses: [] }).mockResolvedValue({
    skills: [{ id: 'last', name: 'Zulu', category: null, level: null }],
    courses: [],
  });
  renderPage(<LearningPage />);
  await screen.findByText('Skill 0');
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByText('Zulu');
  expect(state.request).toHaveBeenCalledWith(LearningCatalogDocument, {
    offset: 20,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Edit skill Zulu' }));
  expect(screen.getByLabelText(/^Name/)).toHaveProperty('value', 'Zulu');
});
