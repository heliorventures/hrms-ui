import { useCallback } from 'react';

import { UI_EMPTY_TEXT, UI_FORM_TEXT, UI_PLACEHOLDER_TEXT } from '../../constants/uiText';

import SearchableSelect, { type SearchableSelectAvailability } from './SearchableSelect';

export interface EmployeePickRow {
  id: string;
  employeeCode: string;
  fullName: string;
}

export interface EmployeeSearchSelectProps {
  label?: string;
  employees: EmployeePickRow[];
  valueId: string;
  onChangeId: (id: string) => void;
  required?: boolean;
  disabled?: boolean;
  availability?: SearchableSelectAvailability;
  stateMessage?: string;
}

const getEmployeeId = (employee: EmployeePickRow) => employee.id;
const getEmployeeLabel = (employee: EmployeePickRow) =>
  `${employee.employeeCode} — ${employee.fullName}`;

/**
 * Searchable employee picker: shows code + name; value is GraphQL employee `id` (UUID).
 */
const EmployeeSearchSelect = ({
  label = 'Employee',
  employees,
  valueId,
  onChangeId,
  required,
  disabled,
  availability,
  stateMessage,
}: EmployeeSearchSelectProps) => {
  const handleChange = useCallback(
    (employee: EmployeePickRow | null) => onChangeId(employee?.id ?? ''),
    [onChangeId]
  );

  return (
    <SearchableSelect
      label={label}
      options={employees}
      value={valueId || null}
      onChange={handleChange}
      getOptionId={getEmployeeId}
      getOptionLabel={getEmployeeLabel}
      placeholder={UI_PLACEHOLDER_TEXT.employeeSearch}
      selectionPlaceholder={UI_FORM_TEXT.chooseEmployee}
      emptyMessage={UI_EMPTY_TEXT.employeesWithPeriod}
      noResultsMessage={UI_EMPTY_TEXT.employeesMatchSearch}
      required={required}
      disabled={disabled}
      availability={availability}
      stateMessage={stateMessage}
    />
  );
};

export default EmployeeSearchSelect;
