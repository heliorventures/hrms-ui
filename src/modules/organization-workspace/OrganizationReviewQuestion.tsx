import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';

import type { ManagerReviewAnswer, ManagerReviewQuestion } from './organizationReview';

interface Props {
  question: ManagerReviewQuestion;
  value: ManagerReviewAnswer;
  onChange: (value: ManagerReviewAnswer) => void;
}
const ChoiceQuestion = ({ question, value, onChange }: Props) => {
  const single = question.type === 'SINGLE_CHOICE';
  const toggle = (id: string, enabled: boolean) => {
    if (single) {
      onChange({ ...value, options: enabled ? [id] : [] });
      return;
    }
    onChange({
      ...value,
      options: enabled ? [...value.options, id] : value.options.filter((option) => option !== id),
    });
  };
  return (
    <div className="space-y-2">
      {question.options.map((option) => (
        <label key={option.id} className="flex gap-2 text-sm">
          <input
            type={single ? 'radio' : 'checkbox'}
            name={question.id}
            checked={value.options.includes(option.id)}
            onChange={(event) => toggle(option.id, event.target.checked)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

const OrganizationReviewQuestion = (props: Props) => {
  const { question, value, onChange } = props;
  const choice = question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE';
  const rating = question.type === 'RATING' || question.managerRating;
  return (
    <fieldset className="space-y-2 rounded-lg border border-line p-3">
      <legend className="px-1 text-sm font-medium">
        {question.prompt}
        {question.required ? ' (required)' : ''}
      </legend>
      {choice ? <ChoiceQuestion {...props} /> : null}
      {!choice && question.type !== 'RATING' ? (
        <Textarea
          label={`Manager response: ${question.prompt}`}
          required={question.required}
          value={value.text ?? ''}
          onChange={(event) => onChange({ ...value, text: event.target.value })}
          rows={3}
          fullWidth
        />
      ) : null}
      {rating ? (
        <Input
          label={`Manager rating: ${question.prompt}`}
          inputMode="decimal"
          value={value.rating ?? ''}
          required={question.required}
          onChange={(event) => onChange({ ...value, rating: event.target.value })}
        />
      ) : null}
    </fieldset>
  );
};

export default OrganizationReviewQuestion;
