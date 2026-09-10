// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SurveyResultsPanel from './SurveyResultsPanel';
import SurveyReviewPage from './SurveyReviewPage';
import type { SurveyWorkspaceModel } from './useSurveyWorkspace';

afterEach(cleanup);
const results = {
  surveyId: 'survey-1',
  suppressed: false,
  respondentCount: 4,
  minimumReportGroupSize: 3,
  dimensions: [],
  questions: [
    {
      questionId: 'q1',
      prompt: 'Support',
      dimension: 'Support',
      responseCount: 4,
      averageScore: '0',
      options: [],
      comments: ['Helpful team'],
      questionType: 'RATING',
      ratingMin: '1',
      ratingMax: '5',
      skippedCount: 1,
      suppressed: false,
      ratingDistribution: [
        { score: '4', responseCount: 3 },
        { score: '5', responseCount: 1 },
      ],
    },
  ],
};

describe('survey response review', () => {
  it('shows rating distribution, zero averages, skipped counts and expandable notes by question', async () => {
    render(<SurveyResultsPanel results={results} />);
    const chart = screen.getByRole('list', { name: 'Rating distribution: Support' });
    expect(within(chart).getByText('3 · 75%')).toBeTruthy();
    expect(within(chart).getByText('1 · 25%')).toBeTruthy();
    expect(screen.getByText(/average 0/)).toBeTruthy();
    expect(screen.getByText(/1 skipped/)).toBeTruthy();
    const notes = screen.getByText('Notes and comments (1)');
    expect(notes.closest('details')?.open).toBe(false);
    await userEvent.setup().click(notes);
    expect(notes.closest('details')?.open).toBe(true);
    expect(screen.getByText('Helpful team')).toBeTruthy();
  });

  it('uses question respondents as the choice denominator and explains multi-select totals', () => {
    render(
      <SurveyResultsPanel
        results={{
          ...results,
          questions: [
            {
              ...results.questions[0],
              questionType: 'MULTIPLE_CHOICE',
              ratingDistribution: [],
              options: [
                { optionId: 'a', label: 'Training', responseCount: 3 },
                { optionId: 'b', label: 'Mentoring', responseCount: 4 },
              ],
            },
          ],
        }}
      />
    );
    const chart = screen.getByRole('list', { name: 'Option counts: Support' });
    expect(within(chart).getByText('3 · 75%')).toBeTruthy();
    expect(within(chart).getByText('4 · 100%')).toBeTruthy();
    expect(screen.getByText(/Multiple selections can total more than 100%/)).toBeTruthy();
  });

  it('explains a closure gate without claiming more responses are needed or exposing charts', () => {
    render(
      <SurveyResultsPanel
        results={{
          ...results,
          suppressed: true,
          suppressionReason: 'Results become available after this survey is closed',
        }}
      />
    );
    expect(screen.getByText(/Results become available after this survey is closed/)).toBeTruthy();
    expect(screen.queryByText('Helpful team')).toBeNull();
    expect(screen.queryByRole('list', { name: /Rating distribution/ })).toBeNull();
  });

  it('loads unnamed submissions only when requested and allows paging without sending user identity', async () => {
    const openSubmissions = vi.fn();
    const model = {
      selectedSurveyId: 'survey-1',
      canReviewSubmissions: true,
      adminSurveys: [],
      resultsCatalog: [],
      results,
      submissions: null,
      submissionOffset: 0,
      openSubmissions,
      error: null,
    } as unknown as SurveyWorkspaceModel;
    render(<SurveyReviewPage model={model} />);
    expect(openSubmissions).not.toHaveBeenCalled();
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Individual submissions' }));
    expect(openSubmissions).toHaveBeenCalledWith('survey-1');
  });

  it('does not offer individual submissions for scoped aggregate reviewers', () => {
    const model = {
      selectedSurveyId: 'survey-1',
      canReviewSubmissions: false,
      adminSurveys: [],
      resultsCatalog: [],
      results,
    } as unknown as SurveyWorkspaceModel;
    render(<SurveyReviewPage model={model} />);
    expect(screen.queryByRole('tab', { name: 'Individual submissions' })).toBeNull();
  });
});
