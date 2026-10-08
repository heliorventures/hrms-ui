// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SurveyDetailRow } from './surveyQueries';
import SurveyResponsePanel from './SurveyResponsePanel';
import type { SurveyAnswerValue } from './useSurveyView';
import type { SurveyWorkspaceModel } from './useSurveyWorkspace';

afterEach(cleanup);

const survey: SurveyDetailRow = {
  summary: {
    id: 's',
    title: 'Feedback',
    status: 'PUBLISHED',
    completed: false,
    minimumReportGroupSize: 5,
  },
  audienceDepartmentIds: [],
  sections: [
    {
      id: 'section',
      title: 'Questions',
      displayOrder: 0,
      questions: ['RATING', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'LONG_TEXT'].map(
        (questionType) => ({
          id: questionType,
          prompt: questionType,
          questionType,
          dimension: 'Support',
          isRequired: false,
          commentEnabled: true,
          displayOrder: 0,
          ratingMin: '1',
          ratingMax: '5',
          options: [
            { id: 'a', label: 'Alpha', displayOrder: 0 },
            { id: 'b', label: 'Beta', displayOrder: 1 },
          ],
        })
      ),
    },
  ],
};
const Form = ({ preview = false }: { preview?: boolean }) => {
  const [answers, setAnswers] = useState<Record<string, SurveyAnswerValue>>({});
  const model = {
    answers,
    setAnswers,
    surveyMode: preview ? 'preview' : 'respond',
    canRespond: true,
    isBusy: () => false,
    submit: vi.fn(),
  } as unknown as SurveyWorkspaceModel;
  return (
    <>
      <SurveyResponsePanel survey={survey} model={model} />
      <output data-testid="answers">{JSON.stringify(answers)}</output>
    </>
  );
};

describe('survey answer field ownership', () => {
  it('preserves comments and selected values in both editing directions', async () => {
    const user = userEvent.setup();
    render(<Form />);
    const rating = within(screen.getByRole('group', { name: 'RATING' }));
    await user.type(rating.getByRole('textbox'), 'Helpful');
    await user.click(rating.getByRole('radio', { name: '4 out of 5 stars' }));
    await user.type(rating.getByRole('textbox'), ' support');
    for (const type of ['SINGLE_CHOICE', 'MULTIPLE_CHOICE']) {
      const choice = within(screen.getByRole('group', { name: type }));
      await user.type(choice.getByRole('textbox'), 'Because');
      await user.click(choice.getByLabelText('Alpha'));
      await user.type(choice.getByRole('textbox'), ' useful');
      await user.click(choice.getByLabelText('Beta'));
    }
    await user.type(screen.getByRole('textbox', { name: 'LONG_TEXT comment' }), 'Written answer');
    expect(JSON.parse(String(screen.getByTestId('answers').textContent))).toEqual({
      RATING: { numeric: '4', comment: 'Helpful support' },
      SINGLE_CHOICE: { options: ['b'], comment: 'Because useful' },
      MULTIPLE_CHOICE: { options: ['a', 'b'], comment: 'Because useful' },
      LONG_TEXT: { text: 'Written answer' },
    });
  });
  it('disables ratings, choices and text in published preview', async () => {
    const user = userEvent.setup();
    render(<Form preview />);
    await user.click(screen.getByRole('radio', { name: '4 out of 5 stars' }));
    for (const checkbox of screen.getAllByRole('checkbox')) await user.click(checkbox);
    for (const text of screen.getAllByRole('textbox')) await user.type(text, 'Cannot edit');
    expect(screen.getByTestId('answers').textContent).toBe('{}');
    expect(screen.queryByRole('button', { name: 'Submit survey' })).toBeNull();
  });
});
