// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import PerformancePage from './PerformancePage';
import {
  acknowledgementDetail,
  acknowledgementReview,
  goalApprovalScenarios,
  resetPerformanceState,
} from './PerformancePage.test.shared';

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
    responseRevision: 1,
    selfSubmittedAt: '2026-09-01',
  };
  state.request.mockImplementation((document: unknown) =>
    String(document).includes('PerformanceGoalKpisWorkspace')
      ? Promise.resolve({ performanceGoalKpis: [] })
      : String(document).includes('PerformanceReviewDetailWorkspace')
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
    responseRevision: 1,
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
    if (String(document).includes('PerformanceGoalKpisWorkspace'))
      return Promise.resolve({ performanceGoalKpis: [] });
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
        expectedRevision: 1,
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

it.each(goalApprovalScenarios)(
  'offers goal approval only to $label',
  async ({ permissions, scopes, managerEmployeeId, expected }) => {
    state.permissions = permissions;
    state.permissionScopes = { ...scopes };
    const review = {
      ...acknowledgementReview,
      id: 'goal-review',
      employeeId: 'report',
      managerEmployeeId,
      cycleStage: 'GOAL_SETTING',
    };
    const detail = { ...acknowledgementDetail, review };
    state.request.mockImplementation((document: unknown) => {
      if (String(document).includes('PerformanceGoalKpisWorkspace'))
        return Promise.resolve({ performanceGoalKpis: [] });
      if (String(document).includes('PerformanceReviewDetailWorkspace'))
        return Promise.resolve({ performanceReviewDetail: detail });
      return Promise.resolve({ myTeamPerformanceReviews: [review] });
    });
    const tab = permissions.has('performance:manage') ? 'review' : 'team';
    render(
      <MemoryRouter initialEntries={[`/performance?tab=${tab}&review=goal-review`]}>
        <PerformancePage />
      </MemoryRouter>
    );

    await screen.findByText('Goals');
    expect(Boolean(screen.queryByRole('button', { name: 'Approve goals' }))).toBe(expected);
  }
);

it('submits an acknowledgement comment and clears it only after success', async () => {
  state.permissions = new Set(['performance:self']);
  state.permissionScopes = { 'performance:self': 'SELF' };
  state.request.mockImplementation((document: unknown) => {
    if (String(document).includes('PerformanceGoalKpisWorkspace'))
      return Promise.resolve({ performanceGoalKpis: [] });
    if (String(document).includes('PerformanceReviewDetailWorkspace'))
      return Promise.resolve({ performanceReviewDetail: acknowledgementDetail });
    if (String(document).includes('AcknowledgePerformanceReviewWorkspace'))
      return Promise.resolve({ acknowledgePerformanceReview: { review: acknowledgementReview } });
    return Promise.resolve({ myPerformanceReviews: [acknowledgementReview] });
  });
  render(
    <MemoryRouter initialEntries={['/performance?tab=my&review=ack-review']}>
      <PerformancePage />
    </MemoryRouter>
  );

  const comment = await screen.findByLabelText<HTMLTextAreaElement>('Acknowledgement comment');
  fireEvent.change(comment, { target: { value: 'I have reviewed the goals.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Acknowledge appraisal' }));

  await waitFor(() =>
    expect(state.request).toHaveBeenCalledWith(
      expect.stringContaining('AcknowledgePerformanceReviewWorkspace'),
      { id: 'ack-review', comment: 'I have reviewed the goals.', expectedRevision: 1 }
    )
  );
  await waitFor(() => expect(comment.value).toBe(''));
});

it('retains an acknowledgement comment after a mutation failure', async () => {
  state.permissions = new Set(['performance:self']);
  state.permissionScopes = { 'performance:self': 'SELF' };
  state.request.mockImplementation((document: unknown) => {
    if (String(document).includes('PerformanceGoalKpisWorkspace'))
      return Promise.resolve({ performanceGoalKpis: [] });
    if (String(document).includes('PerformanceReviewDetailWorkspace'))
      return Promise.resolve({ performanceReviewDetail: acknowledgementDetail });
    if (String(document).includes('AcknowledgePerformanceReviewWorkspace'))
      return Promise.reject(new Error('temporary failure'));
    return Promise.resolve({ myPerformanceReviews: [acknowledgementReview] });
  });
  render(
    <MemoryRouter initialEntries={['/performance?tab=my&review=ack-review']}>
      <PerformancePage />
    </MemoryRouter>
  );

  const comment = await screen.findByLabelText<HTMLTextAreaElement>('Acknowledgement comment');
  fireEvent.change(comment, { target: { value: 'Keep this acknowledgement.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Acknowledge appraisal' }));

  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  expect(comment.value).toBe('Keep this acknowledgement.');
});
