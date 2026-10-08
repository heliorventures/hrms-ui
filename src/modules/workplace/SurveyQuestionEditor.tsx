import Button from '../../components/common/Button';

import { blankOption, isChoice, type EditorOption, type EditorQuestion } from './surveyEditorModel';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';
const OptionEditor = ({
  options,
  onChange,
}: {
  options: EditorOption[];
  onChange: (options: EditorOption[]) => void;
}) => (
  <div className="space-y-2">
    <p className="text-xs text-content-secondary">
      Blank score means unscored. Option order never determines the score.
    </p>
    {options.map((option, index) => (
      <div key={option.key} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm">
          Option {index + 1} label
          <input
            className={fieldClass}
            value={option.label}
            onChange={(e) =>
              onChange(
                options.map((o) => (o.key === option.key ? { ...o, label: e.target.value } : o))
              )
            }
          />
        </label>
        <label className="text-sm">
          Option {index + 1} score (optional)
          <input
            className={fieldClass}
            type="number"
            step="any"
            value={option.score}
            onChange={(e) =>
              onChange(
                options.map((o) => (o.key === option.key ? { ...o, score: e.target.value } : o))
              )
            }
          />
        </label>
        <Button
          size="sm"
          variant="quiet"
          onClick={() => onChange(options.filter((o) => o.key !== option.key))}
        >
          Remove option {index + 1}
        </Button>
      </div>
    ))}
    <Button size="sm" variant="outline" onClick={() => onChange([...options, blankOption()])}>
      Add option
    </Button>
  </div>
);

const SurveyQuestionEditor = ({
  question: q,
  onChange,
  onRemove,
}: {
  question: EditorQuestion;
  onChange: (q: EditorQuestion) => void;
  onRemove?: () => void;
}) => {
  const changeType = (type: string) => {
    let options: EditorOption[] = [];
    if (isChoice(type)) options = q.options.length ? q.options : [blankOption()];
    onChange({ ...q, type, options });
  };
  return (
    <div className="space-y-2 rounded-md border border-line p-3">
      <div className="grid gap-2 md:grid-cols-4">
        <label className="text-sm">
          Area
          <input
            className={fieldClass}
            value={q.dimension}
            onChange={(e) => onChange({ ...q, dimension: e.target.value })}
          />
        </label>
        <label className="text-sm md:col-span-2">
          Question
          <input
            className={fieldClass}
            value={q.prompt}
            onChange={(e) => onChange({ ...q, prompt: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Answer type
          <select
            className={fieldClass}
            value={q.type}
            onChange={(e) => changeType(e.target.value)}
          >
            <option value="RATING">Rating</option>
            <option value="SINGLE_CHOICE">Single choice</option>
            <option value="MULTIPLE_CHOICE">Multiple choice</option>
            <option value="SHORT_TEXT">Short comment</option>
            <option value="LONG_TEXT">Elaborative comment</option>
          </select>
        </label>
        {q.type === 'RATING' && (
          <label className="text-sm">
            Rating scale
            <select
              className={fieldClass}
              value={
                Number(q.ratingMin) === 1 && [5, 10].includes(Number(q.ratingMax))
                  ? String(Number(q.ratingMax))
                  : 'existing'
              }
              onChange={(e) => {
                if (e.target.value !== 'existing')
                  onChange({ ...q, ratingMin: '1', ratingMax: e.target.value });
              }}
            >
              <option value="5">1–5 stars</option>
              <option value="10">1–10 stars</option>
              {!(Number(q.ratingMin) === 1 && [5, 10].includes(Number(q.ratingMax))) && (
                <option value="existing">
                  Existing scale ({q.ratingMin}–{q.ratingMax})
                </option>
              )}
            </select>
          </label>
        )}
        <label className="text-sm md:col-span-4">
          Question guidance (optional)
          <textarea
            className={fieldClass}
            rows={2}
            maxLength={2000}
            placeholder="Explain what to consider or what the rating scale means."
            value={q.description}
            onChange={(e) => onChange({ ...q, description: e.target.value })}
          />
        </label>
      </div>
      {isChoice(q.type) && (
        <OptionEditor options={q.options} onChange={(options) => onChange({ ...q, options })} />
      )}
      <div className="flex flex-wrap items-center gap-3">
        {(q.type === 'RATING' || isChoice(q.type)) && (
          <label className="text-sm">
            <input
              type="checkbox"
              checked={q.commentEnabled}
              onChange={(e) => onChange({ ...q, commentEnabled: e.target.checked })}
            />{' '}
            Allow an optional comment with this answer
          </label>
        )}
        <label className="text-sm">
          <input
            type="checkbox"
            checked={q.isRequired}
            onChange={(e) => onChange({ ...q, isRequired: e.target.checked })}
          />{' '}
          Required
        </label>
        {onRemove && (
          <Button size="sm" variant="quiet" onClick={onRemove}>
            Remove question
          </Button>
        )}
      </div>
    </div>
  );
};
export default SurveyQuestionEditor;
