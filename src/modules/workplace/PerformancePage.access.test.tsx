// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import PerformancePage from './PerformancePage';
import { resetPerformanceState } from './PerformancePage.test.shared';

const state = vi.hoisted(() => ({
  request: vi.fn(),
  permissions: new Set(['performance:self', 'performance:manage']),
  permissionScopes: { 'performance:self': 'SELF', 'performance:manage': 'ALL' } as Record<
    string,
    string
  >,
}));

vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'me',
      permissions: state.permissions,
      permissionScopes: state.permissionScopes,
      resourceScopes: {},
    },
  }),
}));
afterEach(cleanup);
beforeEach(() => resetPerformanceState(state));

it.each([
  {
    role: 'employee',
    stage: 'SELF_REVIEW',
    tab: 'my',
    employeeId: 'me',
    self: true,
    manager: false,
  },
  {
    role: 'manager',
    stage: 'MANAGER_REVIEW',
    tab: 'team',
    employeeId: 'report',
    self: false,
    manager: true,
  },
])(
  'shows only the $role supplemental ratings while retaining primary ratings',
  async (reviewer) => {
    state.permissions = new Set(['performance:self', 'performance:evaluate']);
    state.permissionScopes = { 'performance:self': 'SELF', 'performance:evaluate': 'TEAM' };
    const review = {
      id: 'rating-review',
      employeeId: reviewer.employeeId,
      employeeName: 'Employee',
      cycleName: 'Annual',
      cycleStage: reviewer.stage,
      status: 'PENDING',
      responseRevision: 1,
    };
    const questions = [
      {
        id: 'self-only',
        prompt: 'Self-rated text',
        questionType: 'LONG_TEXT',
        selfRatingEnabled: true,
        managerRatingEnabled: false,
      },
      {
        id: 'manager-only',
        prompt: 'Manager-rated text',
        questionType: 'LONG_TEXT',
        selfRatingEnabled: false,
        managerRatingEnabled: true,
      },
      {
        id: 'primary-rating',
        prompt: 'Primary rating',
        questionType: 'RATING',
        selfRatingEnabled: false,
        managerRatingEnabled: false,
      },
    ].map((question) => ({ ...question, answerer: 'BOTH', isRequired: false, options: [] }));
    state.request.mockImplementation((document: unknown) => {
      if (String(document).includes('PerformanceGoalKpisWorkspace'))
        return Promise.resolve({ performanceGoalKpis: [] });
      if (String(document).includes('PerformanceReviewDetailWorkspace'))
        return Promise.resolve({
          performanceReviewDetail: {
            review,
            goals: [],
            feedback: [],
            answers: [],
            template: { sections: [{ questions }] },
          },
        });
      return Promise.resolve({
        myPerformanceReviews: [review],
        myTeamPerformanceReviews: [review],
      });
    });
    render(
      <MemoryRouter initialEntries={[`/performance?tab=${reviewer.tab}&review=rating-review`]}>
        <PerformancePage />
      </MemoryRouter>
    );
    const selfQuestion = await screen.findByRole('group', { name: 'Self-rated text' });
    const managerQuestion = screen.getByRole('group', { name: 'Manager-rated text' });
    expect(Boolean(within(selfQuestion).queryByLabelText('Rating'))).toBe(reviewer.self);
    expect(Boolean(within(managerQuestion).queryByLabelText('Rating'))).toBe(reviewer.manager);
    expect(
      within(screen.getByRole('group', { name: 'Primary rating' })).getByLabelText('Rating')
    ).toBeTruthy();
  }
);

it('separates personal work from setup and keeps loading on the clicked action', async () => {
  render(
    <MemoryRouter initialEntries={['/performance?tab=setup']}>
      <PerformancePage />
    </MemoryRouter>
  );
  expect(await screen.findByRole('tab', { name: 'My Performance' })).toBeTruthy();
  const activate = await screen.findByRole('button', { name: 'Activate process' });
  state.request.mockImplementationOnce(() => new Promise(() => {}));
  fireEvent.click(activate);
  await waitFor(() => expect(activate.getAttribute('aria-busy')).toBe('true'));
  expect(screen.getByRole('button', { name: 'Save template' }).getAttribute('aria-busy')).not.toBe(
    'true'
  );
  expect(screen.getByRole('button', { name: 'Save process' }).getAttribute('aria-busy')).not.toBe(
    'true'
  );
});

it('does not fetch administrative catalogs for a personal tab, including HR users', async () => {
  render(
    <MemoryRouter initialEntries={['/performance?tab=my']}>
      <PerformancePage />
    </MemoryRouter>
  );
  await screen.findByText('No assigned performance reviews.');
  expect(
    state.request.mock.calls.some(([document]) =>
      /PerformanceCatalog|PerformanceProgramsWorkspace|TeamPerformanceReviewsWorkspace|PrivatePerformanceFeedbackWorkspace/.test(
        String(document)
      )
    )
  ).toBe(false);
  expect(screen.queryByRole('button', { name: 'Save process' })).toBeNull();
});

it('does not expose administrator tabs to employees even with a setup URL', async () => {
  state.permissions = new Set(['performance:self']);
  state.permissionScopes = { 'performance:self': 'SELF' };
  render(
    <MemoryRouter initialEntries={['/performance?tab=setup']}>
      <PerformancePage />
    </MemoryRouter>
  );
  expect(await screen.findByRole('tab', { name: 'My Performance' })).toBeTruthy();
  expect(screen.queryByRole('tab', { name: 'Setup' })).toBeNull();
  expect(screen.queryByRole('tab', { name: 'Administration' })).toBeNull();
});

it('does not request administration data for an unauthorized administration URL', async () => {
  state.permissions = new Set(['performance:evaluate']);
  state.permissionScopes = { 'performance:evaluate': 'TEAM' };
  render(
    <MemoryRouter initialEntries={['/performance?tab=administration']}>
      <PerformancePage />
    </MemoryRouter>
  );
  await screen.findByText('No assigned performance reviews.');

  expect(
    state.request.mock.calls.some(([document]) =>
      /PerformanceAdminCyclesWorkspace|PerformanceCycleAdministrationWorkspace/.test(
        String(document)
      )
    )
  ).toBe(false);
});

it('preserves the setup draft when switching workflow tabs', async () => {
  render(
    <MemoryRouter initialEntries={['/performance?tab=setup']}>
      <PerformancePage />
    </MemoryRouter>
  );
  fireEvent.change(await screen.findByLabelText('Process name'), {
    target: { value: 'Quarterly growth' },
  });
  fireEvent.click(screen.getByRole('tab', { name: 'Process' }));
  expect(screen.queryByLabelText('Process name')).toBeNull();
  fireEvent.click(screen.getByRole('tab', { name: 'Setup' }));
  expect(screen.getByLabelText('Process name')).toHaveProperty('value', 'Quarterly growth');
});
