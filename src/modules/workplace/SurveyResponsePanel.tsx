import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { canFillSurvey } from './surveyAvailability';
import type { SurveyDetailRow, SurveyQuestionRow } from './surveyQueries';
import SurveyRatingControl from './SurveyRatingControl';
import type { SurveyAnswerValue } from './useSurveyView';
import type { SurveyWorkspaceModel } from './useSurveyWorkspace';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';
type QuestionProps = {
  question: SurveyQuestionRow;
  value: SurveyAnswerValue;
  onChange: (value: SurveyAnswerValue) => void;
};
const ChoiceAnswer = ({ question, value, onChange }: QuestionProps) => {
  const multiple = question.questionType === 'MULTIPLE_CHOICE';
  const select = (id: string, checked: boolean) => {
    if (!multiple) {
      onChange({ ...value, options: checked ? [id] : [] });
      return;
    }
    const current = value.options ?? [];
    onChange({
      ...value,
      options: checked ? [...current, id] : current.filter((option) => option !== id),
    });
  };
  return (
    <div className="space-y-2">
      {question.options.map((option) => (
        <label key={option.id} className="block text-sm">
          <input
            type={multiple ? 'checkbox' : 'radio'}
            name={question.id}
            checked={value.options?.includes(option.id) ?? false}
            onChange={(event) => select(option.id, event.target.checked)}
          />{' '}
          {option.label}
        </label>
      ))}
    </div>
  );
};
const TextAnswer = ({ question, value, onChange }: QuestionProps) => (
  <div>
    <p id={`${question.id}-privacy`} className="mb-2 text-xs text-content-secondary">
      Do not include names, contact details or other identifying information. Comments are not
      automatically anonymized.
    </p>
    <textarea
      aria-label={`${question.prompt} comment`}
      aria-describedby={`${question.id}-privacy`}
      className={fieldClass}
      rows={question.questionType === 'LONG_TEXT' ? 4 : 2}
      value={value.text ?? ''}
      onChange={(event) => onChange({ ...value, text: event.target.value })}
    />
  </div>
);
const QuestionAnswer = (props: QuestionProps) => {
  const { question, value, onChange } = props;
  if (question.questionType === 'RATING')
    return (
      <SurveyRatingControl
        name={question.id}
        label={`${question.prompt} rating`}
        min={question.ratingMin ?? '1'}
        max={question.ratingMax ?? '5'}
        value={value.numeric ?? ''}
        onChange={(numeric) => onChange({ ...value, numeric })}
      />
    );
  if (question.questionType === 'SHORT_TEXT' || question.questionType === 'LONG_TEXT')
    return <TextAnswer {...props} />;
  if (question.questionType === 'SINGLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE')
    return <ChoiceAnswer {...props} />;
  return null;
};
const SurveyQuestionControl = (props: QuestionProps & { readOnly: boolean }) => (
  <fieldset disabled={props.readOnly} className="rounded-md border border-line p-3">
    <legend className="px-1 text-sm font-medium">
      {props.question.prompt}
      {props.question.isRequired ? ' *' : ''}
    </legend>
    <p className="mb-2 text-xs text-content-secondary">Area: {props.question.dimension}</p>
    {props.question.description && (
      <p className="mb-2 text-sm text-content-secondary">{props.question.description}</p>
    )}
    <QuestionAnswer {...props} />
    {props.question.commentEnabled &&
      ['RATING', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(props.question.questionType) && (
        <label className="mt-3 block text-sm">
          Comment / explanation (optional)
          <textarea
            className={fieldClass}
            rows={2}
            maxLength={4000}
            value={props.value.comment ?? ''}
            aria-describedby={`${props.question.id}-comment-privacy`}
            onChange={(event) => props.onChange({ ...props.value, comment: event.target.value })}
          />
          <span
            id={`${props.question.id}-comment-privacy`}
            className="text-xs text-content-secondary"
          >
            Do not include names or identifying details. Comments are not automatically anonymized.
          </span>
        </label>
      )}
  </fieldset>
);
const SurveyResponsePanel = ({
  survey,
  model,
}: {
  survey: SurveyDetailRow;
  model: SurveyWorkspaceModel;
}) => {
  const responding = model.surveyMode === 'respond' && model.canRespond;
  const readOnly = !responding || survey.summary.completed;
  return (
    <Card title={survey.summary.title}>
      <p className="mb-3 rounded-md border border-line p-3 text-sm">
        {survey.summary.responseReviewMode === 'ANONYMOUS_SUBMISSIONS'
          ? 'After this survey closes, authorized HR/Admin reviewers can review your answers together as one unnamed submission, even when the minimum reporting group has not been reached. Your name is not shown. Do not include identifying details in comments.'
          : 'Results are reported in groups after the minimum reporting group is reached. Written comments may be shown without names; do not include identifying details.'}
      </p>
      {survey.summary.description && (
        <p className="mb-3 text-sm text-content-secondary">{survey.summary.description}</p>
      )}
      <div className="space-y-4">
        {survey.sections.map((section) => (
          <section key={section.id}>
            <h2 className="font-semibold">{section.title}</h2>
            <div className="mt-2 space-y-3">
              {section.questions.map((question) => (
                <SurveyQuestionControl
                  key={question.id}
                  question={question}
                  value={model.answers[question.id] ?? {}}
                  onChange={(value) =>
                    model.setAnswers((current) => ({ ...current, [question.id]: value }))
                  }
                  readOnly={readOnly}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      {responding && !survey.summary.completed && canFillSurvey(survey.summary) && (
        <Button
          className="mt-4"
          busy={model.isBusy('submit-survey')}
          onClick={() => void model.submit()}
        >
          Submit survey
        </Button>
      )}
    </Card>
  );
};
export default SurveyResponsePanel;
