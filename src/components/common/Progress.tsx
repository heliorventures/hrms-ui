export interface ProgressProps {
  label: string;
  value?: number;
  min?: number;
  max?: number;
  className?: string;
}

interface ProgressState {
  currentValue?: number;
  percentage?: number;
  rangeIsValid: boolean;
}

const normalizePercentage = (currentValue: number, min: number, max: number) => {
  if (currentValue === min) return 0;
  if (currentValue === max) return 100;

  const scale = Math.max(Math.abs(min), Math.abs(max), Math.abs(currentValue));
  if (!Number.isFinite(scale) || scale <= 0) return undefined;

  const normalizedMin = min / scale;
  const normalizedMax = max / scale;
  const normalizedValue = currentValue / scale;
  const normalizedSpan = normalizedMax - normalizedMin;
  const normalizedPosition = normalizedValue - normalizedMin;
  if (
    !Number.isFinite(normalizedSpan) ||
    normalizedSpan <= 0 ||
    !Number.isFinite(normalizedPosition)
  ) {
    return undefined;
  }

  const percentage = (normalizedPosition / normalizedSpan) * 100;
  return Number.isFinite(percentage) ? Math.min(100, Math.max(0, percentage)) : undefined;
};

const deriveProgressState = (
  value: number | undefined,
  min: number,
  max: number
): ProgressState => {
  const rangeIsValid = Number.isFinite(min) && Number.isFinite(max) && max > min;
  if (!rangeIsValid || value === undefined || !Number.isFinite(value)) {
    return { rangeIsValid };
  }

  const currentValue = Math.min(max, Math.max(min, value));
  const percentage = normalizePercentage(currentValue, min, max);
  if (percentage === undefined) return { rangeIsValid: false };

  return {
    currentValue,
    percentage,
    rangeIsValid,
  };
};

const Progress = ({ label, value, min = 0, max = 100, className = '' }: ProgressProps) => {
  const { currentValue, percentage, rangeIsValid } = deriveProgressState(value, min, max);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={rangeIsValid ? min : undefined}
      aria-valuemax={rangeIsValid ? max : undefined}
      aria-valuenow={currentValue}
      className={`w-full ${currentValue === undefined ? 'motion-reduce:animate-none' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 text-sm text-content-secondary">
        <span>{label}</span>
        {percentage === undefined ? null : (
          <span className="tabular-nums">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line-subtle">
        <div
          aria-hidden="true"
          className={`h-full rounded-full bg-accent transition-[width] motion-reduce:transition-none ${
            percentage === undefined ? 'w-1/3 animate-pulse motion-reduce:animate-none' : ''
          }`}
          style={percentage === undefined ? undefined : { width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;
