import type { ChangeEvent } from 'react';

import {
  type AppraisalQuestionRow,
  type PerformanceReviewDetailRow,
} from './performanceLifecycleQueries';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

export interface PerformanceQuestionAnswerValue {
  text?: string;
  rating?: string;
  options?: string[];
}

export interface PerformanceQuestionAnswerProps {
  question: AppraisalQuestionRow;
  reviewerRole: 'EMPLOYEE' | 'MANAGER' | null;
  value: PerformanceQuestionAnswerValue;
  employeeAnswer?: PerformanceReviewDetailRow['answers'][number];
  readOnly: boolean;
  onChange: (value: PerformanceQuestionAnswerValue) => void;
}

type ChoiceInputProps = {
  question: AppraisalQuestionRow;
  value: PerformanceQuestionAnswerValue;
  onChange: (value: PerformanceQuestionAnswerValue) => void;
};

const isChoiceQuestion = (question: AppraisalQuestionRow): boolean =>
  question.questionType === 'SINGLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE';

const getChoiceInputType = (question: AppraisalQuestionRow): 'radio' | 'checkbox' =>
  question.questionType === 'SINGLE_CHOICE' ? 'radio' : 'checkbox';

const getNextOptions = (
  question: AppraisalQuestionRow,
  current: string[],
  optionId: string,
  checked: boolean
): string[] => {
  if (question.questionType === 'SINGLE_CHOICE') {
    return checked ? [optionId] : [];
  }
  if (checked) {
    return [...current, optionId];
  }
  return current.filter((id) => id !== optionId);
};

const ChoiceInputs = ({ question, value, onChange }: ChoiceInputProps) => {
  const inputType = getChoiceInputType(question);
  return (
    <div className="space-y-2">
      {question.options.map((option) => {
        const checked = value.options?.includes(option.id) ?? false;
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          const options = getNextOptions(
            question,
            value.options ?? [],
            option.id,
            event.target.checked
          );
          onChange({ ...value, options });
        };
        return (
          <label key={option.id} className="block text-sm">
            <input type={inputType} name={question.id} checked={checked} onChange={handleChange} />{' '}
            {option.label}
          </label>
        );
      })}
    </div>
  );
};

const RatingInput = ({
  value,
  onChange,
}: {
  value: PerformanceQuestionAnswerValue;
  onChange: (value: PerformanceQuestionAnswerValue) => void;
}) => (
  <label className="mt-2 block text-sm">
    Rating
    <input
      className={fieldClass}
      inputMode="decimal"
      value={value.rating ?? ''}
      onChange={(event) => onChange({ ...value, rating: event.target.value })}
    />
  </label>
);

const getEmployeeResponse = (
  question: AppraisalQuestionRow,
  employeeAnswer?: PerformanceReviewDetailRow['answers'][number]
): string[] => {
  const employeeChoiceLabels = question.options
    .filter((option) => employeeAnswer?.employeeSelectedOptionIds.includes(option.id))
    .map((option) => option.label);
  return [
    employeeAnswer?.employeeTextAnswer,
    employeeChoiceLabels.length > 0 ? employeeChoiceLabels.join(', ') : undefined,
    employeeAnswer?.selfRating ? `Rating: ${employeeAnswer.selfRating}` : undefined,
  ].filter((item): item is string => Boolean(item));
};

const getManagerResponse = (
  question: AppraisalQuestionRow,
  employeeAnswer?: PerformanceReviewDetailRow['answers'][number]
): string[] =>
  [
    employeeAnswer?.managerTextAnswer,
    question.options
      .filter((option) => employeeAnswer?.managerSelectedOptionIds.includes(option.id))
      .map((option) => option.label)
      .join(', '),
    employeeAnswer?.managerRating ? `Rating: ${employeeAnswer.managerRating}` : undefined,
  ].filter((item): item is string => Boolean(item));

const ResponseDisplay = ({
  employeeResponse,
  managerResponse,
}: {
  employeeResponse: string[];
  managerResponse: string[];
}) => (
  <>
    {employeeResponse.length > 0 && (
      <p className="mb-2 text-xs text-content-secondary">
        Employee response: {employeeResponse.join(' | ')}
      </p>
    )}
    {managerResponse.length > 0 && (
      <p className="mb-2 text-xs text-content-secondary">
        Manager response: {managerResponse.join(' | ')}
      </p>
    )}
  </>
);

const shouldShowRating = (
  question: AppraisalQuestionRow,
  reviewerRole: PerformanceQuestionAnswerProps['reviewerRole']
): boolean =>
  question.questionType === 'RATING' ||
  (reviewerRole === 'EMPLOYEE' && question.selfRatingEnabled) ||
  (reviewerRole === 'MANAGER' && question.managerRatingEnabled);

const PerformanceQuestionAnswer = ({
  question,
  reviewerRole,
  value,
  employeeAnswer,
  readOnly,
  onChange,
}: PerformanceQuestionAnswerProps) => {
  const employeeResponse = getEmployeeResponse(question, employeeAnswer);
  const managerResponse = getManagerResponse(question, employeeAnswer);
  const hasResponse = employeeResponse.length > 0 || managerResponse.length > 0;

  return (
    <fieldset className="rounded-md border border-line p-3">
      <legend className="px-1 text-sm font-medium">
        {question.prompt}
        {question.isRequired ? ' *' : ''}
      </legend>
      <ResponseDisplay employeeResponse={employeeResponse} managerResponse={managerResponse} />
      {readOnly && !hasResponse && (
        <p className="text-sm text-content-secondary">No submitted answer.</p>
      )}
      {!readOnly && (
        <>
          {isChoiceQuestion(question) ? (
            <ChoiceInputs question={question} value={value} onChange={onChange} />
          ) : (
            <textarea
              className={fieldClass}
              rows={3}
              value={value.text ?? ''}
              onChange={(event) => onChange({ ...value, text: event.target.value })}
            />
          )}
          {shouldShowRating(question, reviewerRole) && (
            <RatingInput value={value} onChange={onChange} />
          )}
        </>
      )}
    </fieldset>
  );
};

export default PerformanceQuestionAnswer;
