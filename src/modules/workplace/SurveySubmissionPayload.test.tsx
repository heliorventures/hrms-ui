// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import type { SurveyDetailRow } from './surveyQueries';
import { useSurveyWorkspace } from './useSurveyWorkspace';

const client = vi.hoisted(() => ({ request: vi.fn<[unknown, unknown?], Promise<unknown>>() }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => client }));
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: 'tenant', timezone: 'UTC' } }),
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'private-employee-id',
      permissions: new Set(['survey:respond']),
      permissionScopes: { 'survey:respond': 'SELF' },
      resourceScopes: {},
    },
  }),
}));
const survey: SurveyDetailRow = {
  summary: {
    id: 'survey',
    title: 'Pulse',
    status: 'PUBLISHED',
    minimumReportGroupSize: 3,
    completed: false,
  },
  audienceDepartmentIds: [],
  sections: [
    {
      id: 'section',
      title: 'Work',
      displayOrder: 0,
      questions: [
        {
          id: 'question',
          prompt: 'Support',
          questionType: 'RATING',
          dimension: 'Work',
          isRequired: false,
          ratingMin: '1',
          ratingMax: '5',
          displayOrder: 0,
          options: [],
          commentEnabled: true,
        },
      ],
    },
  ],
};
beforeEach(() => {
  client.request.mockReset();
  client.request.mockImplementation((document: unknown) =>
    Promise.resolve(
      String(document).includes('AvailableSurveysWorkspace')
        ? { availableSurveys: [survey.summary] }
        : { submitSurvey: true }
    )
  );
});
afterEach(cleanup);

it('submits the selected star and its comment without any respondent identity', async () => {
  const hook = renderHook(() => useSurveyWorkspace(true));
  await waitFor(() => expect(hook.result.current.available).toHaveLength(1));
  act(() => {
    hook.result.current.setSurvey(survey);
    hook.result.current.setAnswers({ question: { numeric: '4', comment: ' Helpful guidance ' } });
  });
  await act(async () => {
    await hook.result.current.submit();
  });
  const payload = client.request.mock.calls.find(([document]) =>
    String(document).includes('SubmitSurveyWorkspace')
  )?.[1];
  expect(payload).toEqual({
    id: 'survey',
    answers: [
      {
        questionId: 'question',
        numericAnswer: '4',
        textAnswer: null,
        selectedOptionIds: [],
        comment: 'Helpful guidance',
      },
    ],
  });
  expect(JSON.stringify(payload)).not.toContain('private-employee-id');
});

it('does not silently discard a comment entered without its rating or choice', async () => {
  const hook = renderHook(() => useSurveyWorkspace(true));
  await waitFor(() => expect(hook.result.current.available).toHaveLength(1));
  act(() => {
    hook.result.current.setSurvey(survey);
    hook.result.current.setAnswers({ question: { comment: 'Keep this note' } });
  });
  await act(async () => {
    await hook.result.current.submit();
  });
  expect(
    client.request.mock.calls.some(([document]) =>
      String(document).includes('SubmitSurveyWorkspace')
    )
  ).toBe(false);
  expect(hook.result.current.error).toMatch(/Choose a rating or option/);
  expect(hook.result.current.answers.question.comment).toBe('Keep this note');
});
