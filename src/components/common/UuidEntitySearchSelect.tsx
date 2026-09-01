import { useCallback } from 'react';

import { UI_EMPTY_TEXT, UI_FORM_TEXT, UI_PLACEHOLDER_TEXT } from '../../constants/uiText';

import SearchableSelect, { type SearchableSelectAvailability } from './SearchableSelect';

export type UuidEntityOption = {
  id: string;
  /** Primary line in the list and “Selected” summary */
  title: string;
  /** Optional second line (code, department, description snippet, etc.) */
  subtitle?: string;
};

export interface UuidEntitySearchSelectProps {
  label: string;
  placeholder?: string;
  emptyLabel?: string;
  options: UuidEntityOption[];
  valueId: string;
  onChangeId: (id: string) => void;
  required?: boolean;
  disabled?: boolean;
  availability?: SearchableSelectAvailability;
  stateMessage?: string;
}

const getEntityId = (option: UuidEntityOption) => option.id;
const getEntityLabel = (option: UuidEntityOption) => option.title;
const getEntityDescription = (option: UuidEntityOption) => option.subtitle;

/** Searchable picker for GraphQL entities keyed by UUID (`id`). */
const UuidEntitySearchSelect = ({
  label,
  placeholder = UI_PLACEHOLDER_TEXT.uuidEntitySearch,
  emptyLabel = UI_FORM_TEXT.chooseAny,
  options,
  valueId,
  onChangeId,
  required,
  disabled,
  availability,
  stateMessage,
}: UuidEntitySearchSelectProps) => {
  const handleChange = useCallback(
    (option: UuidEntityOption | null) => onChangeId(option?.id ?? ''),
    [onChangeId]
  );

  return (
    <SearchableSelect
      label={label}
      options={options}
      value={valueId || null}
      onChange={handleChange}
      getOptionId={getEntityId}
      getOptionLabel={getEntityLabel}
      getOptionDescription={getEntityDescription}
      placeholder={placeholder}
      selectionPlaceholder={emptyLabel}
      noResultsMessage={UI_EMPTY_TEXT.matchesTryAnotherSearch}
      required={required}
      disabled={disabled}
      availability={availability}
      stateMessage={stateMessage}
    />
  );
};

export default UuidEntitySearchSelect;
