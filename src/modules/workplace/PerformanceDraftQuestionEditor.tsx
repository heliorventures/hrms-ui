import Button from '../../components/common/Button';

import { performanceFieldClass, type DraftQuestion } from './performanceDraftQuestion';

interface Props {
  index: number;
  onChange: (patch: Partial<DraftQuestion>) => void;
  onRemove: () => void;
  question: DraftQuestion;
  questions: DraftQuestion[];
}

const PerformanceDraftQuestionEditor = ({
  index,
  onChange,
  onRemove,
  question,
  questions,
}: Props) => (
  <div className="rounded-md border border-line p-3">
    <div className="grid gap-2 md:grid-cols-3">
      <label className="text-sm md:col-span-2">
        Question
        <input
          className={performanceFieldClass}
          value={question.prompt}
          onChange={(event) => onChange({ prompt: event.target.value })}
        />
      </label>
      <label className="text-sm">
        Type
        <select
          className={performanceFieldClass}
          value={question.type}
          onChange={(event) => onChange({ type: event.target.value })}
        >
          <option value="LONG_TEXT">Elaborative</option>
          <option value="SHORT_TEXT">Short text</option>
          <option value="RATING">Rating</option>
          <option value="SINGLE_CHOICE">Single choice</option>
          <option value="MULTIPLE_CHOICE">Multiple choice</option>
        </select>
      </label>
      <label className="text-sm">
        Answered by
        <select
          className={performanceFieldClass}
          value={question.answerer}
          onChange={(event) => onChange({ answerer: event.target.value })}
        >
          <option value="BOTH">Employee and manager</option>
          <option value="EMPLOYEE">Employee</option>
          <option value="MANAGER">Manager</option>
        </select>
      </label>
      <label className="text-sm">
        Subquestion of
        <select
          className={performanceFieldClass}
          value={question.parentKey}
          onChange={(event) => onChange({ parentKey: event.target.value })}
        >
          <option value="">Top-level question</option>
          {questions
            .slice(0, index)
            .filter((candidate) => !candidate.parentKey)
            .map((candidate) => (
              <option key={candidate.key} value={candidate.key}>
                {candidate.prompt || candidate.key}
              </option>
            ))}
        </select>
      </label>
      {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
        <label className="text-sm">
          Options (comma separated)
          <input
            className={performanceFieldClass}
            value={question.options}
            onChange={(event) => onChange({ options: event.target.value })}
          />
        </label>
      )}
    </div>
    <div className="mt-2 flex flex-wrap gap-4 text-sm">
      <label>
        <input
          type="checkbox"
          checked={question.isRequired}
          onChange={(event) => onChange({ isRequired: event.target.checked })}
        />{' '}
        Required
      </label>
      <label>
        <input
          type="checkbox"
          checked={question.selfRating}
          onChange={(event) => onChange({ selfRating: event.target.checked })}
        />{' '}
        Self rating
      </label>
      <label>
        <input
          type="checkbox"
          checked={question.managerRating}
          onChange={(event) => onChange({ managerRating: event.target.checked })}
        />{' '}
        Manager rating
      </label>
      {questions.length > 1 && (
        <Button size="sm" variant="quiet" onClick={onRemove}>
          Remove
        </Button>
      )}
    </div>
  </div>
);

export default PerformanceDraftQuestionEditor;
