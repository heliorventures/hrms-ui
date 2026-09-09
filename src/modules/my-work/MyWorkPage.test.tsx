// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import MyWorkPage from './MyWorkPage';

const state = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'me',
      permissions: new Set([
        'performance:self',
        'performance:manage',
        'survey:respond',
        'survey:manage',
      ]),
      permissionScopes: {
        'performance:self': 'SELF',
        'performance:manage': 'ALL',
        'survey:respond': 'SELF',
        'survey:manage': 'ALL',
      },
      resourceScopes: {},
    },
  }),
}));
afterEach(cleanup);
beforeEach(() => {
  state.request.mockReset();
});

it('loads only employee-scoped queries for HR personal work and links to the exact review', async () => {
  state.request.mockImplementation((document: unknown) =>
    String(document).includes('MyPerformanceReviewsWorkspace')
      ? Promise.resolve({
          myPerformanceReviews: [
            { id: 'r1', cycleStage: 'SELF_REVIEW', cycleName: 'Annual', status: 'GOALS_APPROVED' },
          ],
        })
      : Promise.resolve({ availableSurveys: [] })
  );
  render(
    <MemoryRouter initialEntries={['/my-work/tasks']}>
      <MyWorkPage />
    </MemoryRouter>
  );
  expect((await screen.findByRole('link', { name: 'Open task' })).getAttribute('href')).toBe(
    '/performance?tab=my&review=r1'
  );
  expect(
    state.request.mock.calls.every(([document]) =>
      /MyPerformanceReviewsWorkspace|AvailableSurveysWorkspace/.test(String(document))
    )
  ).toBe(true);
});

it('shows load failures instead of claiming there are no pending tasks', async () => {
  state.request.mockRejectedValue(new Error('Service unavailable'));
  render(
    <MemoryRouter initialEntries={['/my-work/tasks']}>
      <MyWorkPage />
    </MemoryRouter>
  );
  expect((await screen.findByRole('alert')).textContent).toContain('Some tasks could not load.');
  expect(screen.queryByText('You have no pending tasks.')).toBeNull();
});
