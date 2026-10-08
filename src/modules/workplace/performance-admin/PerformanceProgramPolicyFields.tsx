import Button from '../../../components/common/Button';

import type {
  PerformancePopulationMode,
  PerformancePopulationOption,
} from '../performanceAdminQueries';

import {
  deadlineFields,
  fieldClass,
  type DeadlineKey,
  type PolicyDraft,
} from './performanceProgramPolicy';

export const PolicyDeadlines = ({
  draft,
  disabled,
  onChange,
}: {
  draft: PolicyDraft;
  disabled: boolean;
  onChange: (key: DeadlineKey, value: number | null) => void;
}) => (
  <div className="mt-4 grid gap-3 md:grid-cols-5">
    {deadlineFields.map(({ key, label }) => (
      <label key={key} className="text-sm">
        {label} due day
        <input
          aria-label={`${label} due day`}
          className={fieldClass}
          type="number"
          min="0"
          step="1"
          disabled={disabled}
          placeholder="Optional"
          value={draft[key] ?? ''}
          onChange={(event) =>
            onChange(key, event.target.value === '' ? null : Number(event.target.value))
          }
        />
      </label>
    ))}
  </div>
);

export const PopulationPicker = ({
  mode,
  options,
  nextCursor,
  search,
  selectedIds,
  disabled,
  onSearchChange,
  onLoadMore,
  onToggle,
}: {
  mode: PerformancePopulationMode;
  options: PerformancePopulationOption[];
  nextCursor?: string | null;
  search: string;
  selectedIds: string[];
  disabled: boolean;
  onSearchChange: (value: string) => void;
  onLoadMore: () => void;
  onToggle: (id: string) => void;
}) => {
  if (mode === 'ALL') {
    return (
      <p className="mt-3 text-sm text-content-secondary">
        Eligible employees are selected at launch.
      </p>
    );
  }
  const selection = new Set(selectedIds);
  return (
    <div className="mt-4 space-y-2">
      <label className="text-sm">
        Search {mode.toLowerCase()}
        <input
          className={fieldClass}
          disabled={disabled}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <p className="text-sm text-content-secondary">{selectedIds.length} retained selection(s)</p>
      <ul className="max-h-56 divide-y divide-line overflow-auto rounded-md border border-line">
        {options.map((option) => (
          <li key={option.id} className="p-2 text-sm">
            <label className="flex gap-2">
              <input
                type="checkbox"
                disabled={disabled}
                checked={selection.has(option.id)}
                onChange={() => onToggle(option.id)}
              />
              {option.name}
            </label>
          </li>
        ))}
      </ul>
      {nextCursor && (
        <Button size="sm" variant="outline" disabled={disabled} onClick={onLoadMore}>
          Load more
        </Button>
      )}
    </div>
  );
};
