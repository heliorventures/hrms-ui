type Props = {
  name: string;
  label: string;
  min: string;
  max: string;
  value: string;
  onChange: (value: string) => void;
};

const SurveyRatingControl = ({ name, label, min, max, value, onChange }: Props) => {
  const lower = Number(min);
  const upper = Number(max);
  const stars = lower === 1 && (upper === 5 || upper === 10);
  return (
    <div className="space-y-2">
      {stars ? (
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
          {Array.from({ length: upper }, (_, index) => index + 1).map((score) => (
            <label key={score} className="relative cursor-pointer">
              <input
                type="radio"
                name={name}
                value={score}
                aria-label={`${score} out of ${upper} stars`}
                checked={value !== '' && Number(value) === score}
                onChange={() => onChange(String(score))}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-11 w-11 items-center justify-center rounded-md border text-3xl peer-focus-visible:ring-2 peer-focus-visible:ring-focus ${value !== '' && Number(value) >= score ? 'border-accent bg-accent/10 text-accent' : 'border-line text-content-secondary'}`}
              >
                {value !== '' && Number(value) >= score ? '★' : '☆'}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          <label className="block text-sm" htmlFor={`${name}-rating`}>
            {label} ({min}–{max})
          </label>
          <input
            id={`${name}-rating`}
            className="min-h-11 w-full accent-accent"
            type="range"
            min={min}
            max={max}
            step="any"
            value={value || min}
            aria-valuetext={value || 'No rating selected'}
            onChange={(event) => onChange(event.target.value)}
          />
          {value === '' && (
            <button type="button" className="text-sm underline" onClick={() => onChange(min)}>
              Select minimum ({min})
            </button>
          )}
        </div>
      )}
      <p className="text-sm text-content-secondary" aria-live="polite">
        {value === '' ? 'No rating selected' : `${value} / ${max}`}
      </p>
      {value !== '' && (
        <button type="button" className="text-xs underline" onClick={() => onChange('')}>
          Clear rating
        </button>
      )}
    </div>
  );
};

export default SurveyRatingControl;
