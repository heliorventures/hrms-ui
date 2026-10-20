import { expect, it } from 'vitest';

import { managerReviewPayload, readManagerReview } from './organizationReview';

const review = {
  review: { id: 'review-a', response_revision: 4, employee_name: 'Employee A' },
  template: {
    sections: [
      {
        questions: [
          {
            id: 'q-manager',
            prompt: 'Review',
            question_type: 'LONG_TEXT',
            answerer: 'BOTH',
            is_required: true,
            manager_rating_enabled: false,
            options: [],
          },
          {
            id: 'q-self',
            prompt: 'Self review',
            question_type: 'LONG_TEXT',
            answerer: 'EMPLOYEE',
            is_required: false,
            manager_rating_enabled: false,
            options: [],
          },
        ],
      },
    ],
  },
  answers: [
    {
      question_id: 'q-manager',
      employee_text_answer: 'Private employee response',
      employee_selected_option_ids: [],
      manager_text_answer: 'Existing manager answer',
      manager_selected_option_ids: [],
    },
  ],
};

it('submits only manager answers and the source response revision', () => {
  const parsed = readManagerReview(review);
  expect(parsed.questions.map((question) => question.id)).toEqual(['q-manager']);
  const payload = managerReviewPayload(
    parsed,
    { 'q-manager': { text: 'Final answer', options: [] } },
    '4.0',
    'Strong'
  );
  expect(payload).toEqual({
    expected_revision: 4,
    final_rating: '4.0',
    performance_band: 'Strong',
    answers: [{ question_id: 'q-manager', text_answer: 'Final answer', selected_option_ids: [] }],
  });
  expect(JSON.stringify(payload)).not.toContain('Private employee response');
});

it('rejects missing response revisions instead of using a source record version', () => {
  expect(() => readManagerReview({ ...review, review: { id: 'review-a' } })).toThrow(
    'response revision'
  );
});
