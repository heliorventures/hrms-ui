// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SurveysPage from './SurveysPage';

const state = vi.hoisted(() => ({
  request: vi.fn<[unknown, unknown?], Promise<unknown>>(),
  permissions: new Set<string>(['survey:respond']),
  scopes: { 'survey:respond': 'SELF' } as Record<string, string>,
}));

vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'employee-1',
      permissions: state.permissions,
      permissionScopes: state.scopes,
      resourceScopes: {},
    },
  }),
}));

beforeEach(() => {
  state.permissions = new Set(['survey:respond']);
  state.scopes = { 'survey:respond': 'SELF' };
  state.request.mockReset();
  state.request.mockImplementation((document: unknown) => {
    const source = String(document);
    if (source.includes('AvailableSurveysWorkspace')) {
      return Promise.resolve({
        availableSurveys: [
          {
            id: 'survey-1',
            title: 'Pulse',
            status: 'PUBLISHED',
            minimumReportGroupSize: 5,
            completed: false,
          },
        ],
      });
    }
    if (source.includes('SurveyDetailWorkspace')) {
      return Promise.resolve({
        survey: {
          summary: {
            id: 'survey-1',
            title: 'Pulse',
            status: 'PUBLISHED',
            minimumReportGroupSize: 5,
            completed: false,
          },
          audienceDepartmentIds: [],
          sections: [
            {
              id: 'section-1',
              title: 'Engagement',
              displayOrder: 0,
              questions: [
                {
                  id: 'question-1',
                  dimension: 'Leadership',
                  questionType: 'RATING',
                  prompt: 'I receive useful direction',
                  isRequired: true,
                  ratingMin: '1',
                  ratingMax: '5',
                  displayOrder: 0,
                  options: [],
                },
              ],
            },
          ],
        },
      });
    }
    if (source.includes('SubmitSurveyWorkspace')) return Promise.resolve({ submitSurvey: true });
    return Promise.resolve({});
  });
});

afterEach(cleanup);

describe('SurveysPage', () => {
  it('submits an assigned survey without a respondent identity in the payload', async () => {
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'Fill survey' }));
    await user.type(await screen.findByLabelText('I receive useful direction rating'), '4');
    await user.click(screen.getByRole('button', { name: 'Submit survey' }));
    await waitFor(() => {
      const call = state.request.mock.calls.find(([document]) =>
        String(document).includes('SubmitSurveyWorkspace')
      );
      expect(call?.[1]).toEqual({
        id: 'survey-1',
        answers: [
          { questionId: 'question-1', selectedOptionIds: [], numericAnswer: '4', textAnswer: null },
        ],
      });
      expect(JSON.stringify(call?.[1])).not.toContain('employee-1');
    });
  });

  it('explains threshold suppression without rendering response details', async () => {
    state.permissions = new Set(['survey:results']);
    state.scopes = { 'survey:results': 'TEAM' };
    state.request.mockImplementation((document: unknown) => {
      if (String(document).includes('SurveyResultsCatalogWorkspace'))
        return Promise.resolve({
          surveyResultsCatalog: [
            {
              id: 'survey-1',
              title: 'Pulse',
              status: 'CLOSED',
              minimumReportGroupSize: 5,
              completed: false,
            },
          ],
        });
      if (String(document).includes('SurveyResultsWorkspace'))
        return Promise.resolve({
          surveyResults: {
            surveyId: 'survey-1',
            suppressed: true,
            respondentCount: null,
            minimumReportGroupSize: 5,
            dimensions: [],
            questions: [],
          },
        });
      return Promise.resolve({});
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'Aggregate results' }));
    expect(
      await screen.findByText(/Results remain hidden until at least 5 responses/)
    ).toBeTruthy();
    expect(screen.queryByText(/qualifying responses/)).toBeNull();
  });
});
