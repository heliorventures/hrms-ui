import { act, renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';

import type { PerformanceReviewDetailRow } from './performanceLifecycleQueries';
import { usePerformanceReviewDrafts } from './usePerformanceReviewDrafts';

const detail = (
  responseRevision: number,
  employeeText = 'Employee answer'
): PerformanceReviewDetailRow => ({
  review: {
    id: 'participant-1',
    reviewCycleId: 'cycle-1',
    employeeId: 'employee-1',
    employeeName: 'Employee',
    appraisalTemplateId: 'template-1',
    cycleName: 'Annual',
    cycleStartDate: '2026-01-01',
    cycleEndDate: '2026-12-31',
    cycleStage: 'SELF_REVIEW',
    status: 'PENDING',
    responseRevision,
  },
  goals: [],
  feedback: [],
  template: {
    id: 'template-1',
    performanceProgramId: 'program-1',
    version: 1,
    name: 'Annual',
    status: 'PUBLISHED',
    sections: [
      {
        id: 'section-1',
        title: 'Questions',
        displayOrder: 1,
        questions: [
          {
            id: 'question-1',
            questionType: 'LONG_TEXT',
            prompt: 'What changed?',
            isRequired: false,
            answerer: 'BOTH',
            selfRatingEnabled: false,
            managerRatingEnabled: false,
            displayOrder: 1,
            options: [],
          },
        ],
      },
    ],
  },
  answers: [
    {
      questionId: 'question-1',
      employeeTextAnswer: employeeText,
      employeeSelectedOptionIds: [],
      managerTextAnswer: 'Manager answer',
      managerSelectedOptionIds: [],
    },
  ],
});

it('hydrates the submitted role answer when a reopened revision becomes current', () => {
  const { result } = renderHook(() => usePerformanceReviewDrafts());

  act(() => result.current.hydrateReviewDrafts(detail(2, 'Retained self answer')));

  expect(result.current.responses['question-1']).toMatchObject({ text: 'Retained self answer' });
});

it('retains in-progress answers when a background reload returns the same revision', () => {
  const { result } = renderHook(() => usePerformanceReviewDrafts());
  act(() => result.current.hydrateReviewDrafts(detail(2)));
  act(() => result.current.setResponses({ 'question-1': { text: 'Unsubmitted edit' } }));
  act(() => result.current.hydrateReviewDrafts(detail(2, 'Server refresh')));

  expect(result.current.responses['question-1']).toMatchObject({ text: 'Unsubmitted edit' });
});

it('hydrates manager fields when the stage changes within the same response revision', () => {
  const { result } = renderHook(() => usePerformanceReviewDrafts());
  const selfReview = detail(2, 'Employee answer');
  const managerReview = {
    ...selfReview,
    review: { ...selfReview.review, cycleStage: 'MANAGER_REVIEW' },
  };

  act(() => result.current.hydrateReviewDrafts(selfReview));
  act(() => result.current.hydrateReviewDrafts(managerReview));

  expect(result.current.responses['question-1']).toMatchObject({ text: 'Manager answer' });
});
