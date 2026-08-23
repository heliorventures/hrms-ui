import { useCallback, useDeferredValue, useId, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

export type SearchableSelectAvailability = 'ready' | 'loading' | 'unavailable';

export interface SearchableSelectProps<T> {
  label: string;
  options: readonly T[];
  value: string | null;
  onChange: (option: T | null) => void;
  getOptionId: (option: T) => string;
  getOptionLabel: (option: T) => string;
  getOptionDescription?: (option: T) => string | undefined;
  placeholder?: string;
  selectionPlaceholder?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  availability?: SearchableSelectAvailability;
  stateMessage?: string;
  disabled?: boolean;
  required?: boolean;
}

type OptionAccessors<T> = Pick<
  SearchableSelectProps<T>,
  'getOptionDescription' | 'getOptionId' | 'getOptionLabel'
>;
const filterOptions = <T,>(
  options: readonly T[],
  query: string,
  { getOptionDescription, getOptionId, getOptionLabel }: OptionAccessors<T>
) => {
  if (!query) return options;
  return options.filter((option) =>
    [getOptionId(option), getOptionLabel(option), getOptionDescription?.(option) ?? '']
      .join(' ')
      .toLocaleLowerCase()
      .includes(query)
  );
};

const includeSelectedOption = <T,>(
  filteredOptions: readonly T[],
  selectedOption: T | undefined,
  selectedIsFilteredOut: boolean
) => {
  if (!selectedOption || !selectedIsFilteredOut) return filteredOptions;
  return [selectedOption, ...filteredOptions];
};

const selectedFrom = <T,>(optionById: ReadonlyMap<string, T>, selectedId: string | null) =>
  selectedId ? optionById.get(selectedId) : undefined;

const optionFromSelection = <T,>(optionById: ReadonlyMap<string, T>, selectedId: string) =>
  selectedId ? (optionById.get(selectedId) ?? null) : null;

const resultAnnouncementFor = (count: number) =>
  `${count} ${count === 1 ? 'result' : 'results'} available.`;

const RequiredMarker = ({ required }: { required: boolean }) =>
  required ? (
    <span className="ml-1 text-status-danger" aria-hidden="true">
      *
    </span>
  ) : null;

interface FieldLabelProps {
  id: string;
  htmlFor: string;
  label: string;
  required: boolean;
}
const FieldLabel = ({ id, htmlFor, label, required }: FieldLabelProps) => (
  <label id={id} htmlFor={htmlFor} className="block text-sm font-medium text-content-secondary">
    {label}
    <RequiredMarker required={required} />
  </label>
);

const SelectedOptionSummary = <T,>({
  option,
  getOptionLabel,
  getOptionDescription,
}: {
  option: T | undefined;
  getOptionLabel: (option: T) => string;
  getOptionDescription?: (option: T) => string | undefined;
}) => {
  if (!option) return null;
  const description = getOptionDescription?.(option);
  return (
    <p className="text-sm text-content-muted">
      Selected: <span className="font-medium text-content-primary">{getOptionLabel(option)}</span>
      {description ? <span> — {description}</span> : null}
    </p>
  );
};

const OptionElements = <T,>({
  options,
  getOptionId,
  getOptionLabel,
  getOptionDescription,
}: { options: readonly T[] } & OptionAccessors<T>) => (
  <>
    {options.map((option) => {
      const optionId = getOptionId(option);
      const label = getOptionLabel(option);
      const description = getOptionDescription?.(option);
      const visibleLabel = description ? `${label} — ${description}` : label;
      return (
        <option key={optionId} value={optionId}>
          {visibleLabel}
        </option>
      );
    })}
  </>
);

const ResultMessage = ({
  availability,
  optionsAvailable,
  hasSearch,
  resultCount,
  selectedIsFilteredOut,
  emptyMessage,
  noResultsMessage,
}: {
  availability: SearchableSelectAvailability;
  optionsAvailable: boolean;
  hasSearch: boolean;
  resultCount: number;
  selectedIsFilteredOut: boolean;
  emptyMessage: string;
  noResultsMessage: string;
}) => {
  if (availability !== 'ready') return null;
  if (!optionsAvailable) return <p className="text-sm text-content-muted">{emptyMessage}</p>;
  if (hasSearch && resultCount === 0) {
    return (
      <p className="text-sm text-content-muted">
        {noResultsMessage}
        {selectedIsFilteredOut ? ' Current selection remains selected.' : null}
      </p>
    );
  }
  return null;
};

const availabilityMessageFor = (
  availability: 'loading' | 'unavailable',
  stateMessage: string | undefined
) => stateMessage ?? (availability === 'loading' ? 'Loading options.' : 'Options are unavailable.');

const fieldIdsFor = (generatedId: string) => ({
  labelId: `${generatedId}-label`,
  listboxId: `${generatedId}-listbox`,
  statusId: `${generatedId}-status`,
});

const selectedIsFilteredOutFor = <T,>(
  query: string,
  selectedOption: T | undefined,
  selectedId: string | null,
  filteredOptions: readonly T[],
  getOptionId: (option: T) => string
) => {
  if (!query || !selectedOption) return false;
  return !filteredOptions.some((option) => getOptionId(option) === selectedId);
};

const resultAnnouncementForState = ({
  availability,
  stateMessage,
  resultCount,
  selectedIsFilteredOut,
  selectionUnavailable,
}: {
  availability: SearchableSelectAvailability;
  stateMessage: string | undefined;
  resultCount: number;
  selectedIsFilteredOut: boolean;
  selectionUnavailable: boolean;
}) => {
  if (availability !== 'ready') return availabilityMessageFor(availability, stateMessage);
  if (selectedIsFilteredOut) {
    return `${resultCount} search results. Current selection remains available.`;
  }
  const selectionMessage = selectionUnavailable ? ' Current selection is unavailable.' : '';
  return `${resultAnnouncementFor(resultCount)}${selectionMessage}`;
};

const SearchInput = ({
  label,
  listboxId,
  statusId,
  search,
  onSearchChange,
  disabled,
  placeholder,
}: {
  label: string;
  listboxId: string;
  statusId: string;
  search: string;
  onSearchChange: (search: string) => void;
  disabled: boolean;
  placeholder: string;
}) => (
  <input
    type="search"
    autoComplete="off"
    value={search}
    onChange={(event) => onSearchChange(event.currentTarget.value)}
    disabled={disabled}
    placeholder={placeholder}
    aria-label={`Search ${label}`}
    aria-controls={listboxId}
    aria-describedby={statusId}
    className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-content-primary placeholder:text-content-muted focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-content-muted disabled:opacity-70 md:min-h-9 md:text-sm"
  />
);

const NativeListbox = <T,>({
  id,
  labelId,
  statusId,
  value,
  onChange,
  required,
  disabled,
  selectionPlaceholder,
  selectionUnavailable,
  options,
  getOptionId,
  getOptionLabel,
  getOptionDescription,
}: {
  id: string;
  labelId: string;
  statusId: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  required: boolean;
  disabled: boolean;
  selectionPlaceholder: string;
  selectionUnavailable: boolean;
  options: readonly T[];
} & OptionAccessors<T>) => (
  <select
    id={id}
    aria-labelledby={labelId}
    aria-describedby={statusId}
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
    size={Math.min(10, Math.max(4, options.length + (selectionUnavailable ? 2 : 1)))}
    className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-content-primary focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-content-muted disabled:opacity-70 md:text-sm"
  >
    <option value="">{selectionPlaceholder}</option>
    {selectionUnavailable ? (
      <option value={value} disabled>
        Selected option is unavailable.
      </option>
    ) : null}
    <OptionElements
      options={options}
      getOptionId={getOptionId}
      getOptionLabel={getOptionLabel}
      getOptionDescription={getOptionDescription}
    />
  </select>
);

const SearchableSelect = <T,>({
  label,
  options,
  value,
  onChange,
  getOptionId,
  getOptionLabel,
  getOptionDescription,
  placeholder,
  selectionPlaceholder = 'Choose an option',
  emptyMessage = 'No options are available.',
  noResultsMessage = 'No results match your search.',
  availability = 'ready',
  stateMessage,
  disabled = false,
  required = false,
}: SearchableSelectProps<T>) => {
  const generatedId = useId();
  const { labelId, listboxId, statusId } = fieldIdsFor(generatedId);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLocaleLowerCase();

  const optionById = useMemo(
    () => new Map(options.map((option) => [getOptionId(option), option])),
    [getOptionId, options]
  );
  const selectedOption = selectedFrom(optionById, value);
  const accessors = useMemo(
    () => ({ getOptionDescription, getOptionId, getOptionLabel }),
    [getOptionDescription, getOptionId, getOptionLabel]
  );
  const filteredOptions = useMemo(
    () => filterOptions(options, normalizedSearch, accessors),
    [accessors, normalizedSearch, options]
  );
  const selectedIsFilteredOut = selectedIsFilteredOutFor(
    normalizedSearch,
    selectedOption,
    value,
    filteredOptions,
    getOptionId
  );
  const visibleOptions = useMemo(
    () => includeSelectedOption(filteredOptions, selectedOption, selectedIsFilteredOut),
    [filteredOptions, selectedIsFilteredOut, selectedOption]
  );

  const handleSelection = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selectedId = event.currentTarget.value;
      onChange(optionFromSelection(optionById, selectedId));
    },
    [onChange, optionById]
  );

  const resultCount = filteredOptions.length;
  const selectionUnavailable = Boolean(value && !selectedOption);
  const resultAnnouncement = resultAnnouncementForState({
    availability,
    stateMessage,
    resultCount,
    selectedIsFilteredOut,
    selectionUnavailable,
  });
  const searchPlaceholder = placeholder || `Search ${label}`;
  const selectedValue = value || '';
  const controlsDisabled = disabled || availability !== 'ready';

  return (
    <div className="w-full space-y-2">
      <FieldLabel id={labelId} htmlFor={listboxId} label={label} required={required} />
      <SearchInput
        label={label}
        listboxId={listboxId}
        statusId={statusId}
        search={search}
        onSearchChange={setSearch}
        disabled={controlsDisabled}
        placeholder={searchPlaceholder}
      />
      <SelectedOptionSummary
        option={selectedOption}
        getOptionLabel={getOptionLabel}
        getOptionDescription={getOptionDescription}
      />
      <NativeListbox
        id={listboxId}
        labelId={labelId}
        statusId={statusId}
        value={selectedValue}
        onChange={handleSelection}
        required={required}
        disabled={controlsDisabled}
        selectionPlaceholder={selectionPlaceholder}
        selectionUnavailable={selectionUnavailable}
        options={visibleOptions}
        getOptionId={getOptionId}
        getOptionLabel={getOptionLabel}
        getOptionDescription={getOptionDescription}
      />
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-sm text-content-muted"
      >
        {resultAnnouncement}
      </p>
      <ResultMessage
        availability={availability}
        optionsAvailable={options.length > 0}
        hasSearch={Boolean(normalizedSearch)}
        resultCount={resultCount}
        selectedIsFilteredOut={selectedIsFilteredOut}
        emptyMessage={emptyMessage}
        noResultsMessage={noResultsMessage}
      />
    </div>
  );
};

export default SearchableSelect;
