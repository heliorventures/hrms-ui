// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import PerformancePage from './PerformancePage';

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
beforeEach(() => {
  state.permissions = new Set(['performance:self', 'performance:manage']);
  state.permissionScopes = { 'performance:self': 'SELF', 'performance:manage': 'ALL' };
  state.request.mockImplementation((document: unknown) => {
    const source = String(document);
    if (source.includes('MyPerformanceReviewsWorkspace'))
      return Promise.resolve({ myPerformanceReviews: [] });
    if (source.includes('TeamPerformanceReviewsWorkspace'))
      return Promise.resolve({ myTeamPerformanceReviews: [] });
    if (source.includes('PerformanceProgramsWorkspace'))
      return Promise.resolve({
        performancePrograms: [{ id: 'p1', name: 'Annual', status: 'DRAFT' }],
      });
    if (source.includes('AppraisalTemplatesWorkspace'))
      return Promise.resolve({ appraisalTemplates: [] });
    return Promise.resolve({ reviewCycles: [], goals: [] });
  });
  state.request.mockClear();
});

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
      /PerformanceCatalog|PerformanceProgramsWorkspace|TeamPerformanceReviewsWorkspace/.test(
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

it('opens the linked submitted appraisal with saved answers and no resubmission control', async () => {
  state.permissions = new Set(['performance:self']);
  state.permissionScopes = { 'performance:self': 'SELF' };
  const review = {
    id: 'r1',
    employeeId: 'me',
    employeeName: 'Employee',
    cycleName: 'Annual',
    cycleStage: 'SELF_REVIEW',
    status: 'SELF_SUBMITTED',
    selfSubmittedAt: '2026-09-01',
  };
  state.request.mockImplementation((document: unknown) =>
    String(document).includes('PerformanceReviewDetailWorkspace')
      ? Promise.resolve({
          performanceReviewDetail: {
            review,
            goals: [],
            feedback: [],
            template: {
              sections: [
                {
                  questions: [
                    {
                      id: 'q1',
                      prompt: 'Achievements',
                      answerer: 'BOTH',
                      questionType: 'LONG_TEXT',
                      options: [],
                    },
                  ],
                },
              ],
            },
            answers: [
              {
                questionId: 'q1',
                employeeTextAnswer: 'Delivered the project',
                employeeSelectedOptionIds: [],
                managerSelectedOptionIds: [],
              },
            ],
          },
        })
      : Promise.resolve({ myPerformanceReviews: [review] })
  );
  render(
    <MemoryRouter initialEntries={['/performance?tab=my&review=r1']}>
      <PerformancePage />
    </MemoryRouter>
  );
  expect(await screen.findByText('Employee response: Delivered the project')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Submit self-appraisal' })).toBeNull();
  expect(state.request).toHaveBeenCalledWith(
    expect.stringContaining('PerformanceReviewDetailWorkspace'),
    { participantId: 'r1' }
  );
});

it('submits an untouched optional appraisal question as an empty answer', async () => {
  state.permissions = new Set(['performance:self']);
  state.permissionScopes = { 'performance:self': 'SELF' };
  const review = {
    id: 'r1',
    employeeId: 'me',
    employeeName: 'Employee',
    cycleName: 'Annual',
    cycleStage: 'SELF_REVIEW',
    status: 'PENDING',
  };
  const detail = {
    review,
    goals: [],
    feedback: [],
    answers: [],
    template: {
      sections: [
        {
          questions: [
            {
              id: 'optional',
              prompt: 'Anything else?',
              answerer: 'BOTH',
              questionType: 'LONG_TEXT',
              isRequired: false,
              options: [],
            },
          ],
        },
      ],
    },
  };
  state.request.mockImplementation((document: unknown) => {
    if (String(document).includes('PerformanceReviewDetailWorkspace'))
      return Promise.resolve({ performanceReviewDetail: detail });
    if (String(document).includes('SubmitSelfAppraisalWorkspace'))
      return Promise.resolve({ submitSelfAppraisal: detail });
    return Promise.resolve({ myPerformanceReviews: [review] });
  });
  render(
    <MemoryRouter initialEntries={['/performance?tab=my&review=r1']}>
      <PerformancePage />
    </MemoryRouter>
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Submit self-appraisal' }));
  await waitFor(() =>
    expect(state.request).toHaveBeenCalledWith(
      expect.stringContaining('SubmitSelfAppraisalWorkspace'),
      {
        id: 'r1',
        answers: [
          {
            questionId: 'optional',
            textAnswer: null,
            rating: null,
            selectedOptionIds: [],
          },
        ],
      }
    )
  );
});
