import { useMemo, useState } from 'react';
import { UI_EMPTY_TEXT, UI_FORM_TEXT, UI_PLACEHOLDER_TEXT } from '../../constants/uiText';

export interface EmployeePickRow {
  id: string;
  employeeCode: string;
  fullName: string;
}

interface EmployeeSearchSelectProps {
  label?: string;
  employees: EmployeePickRow[];
  valueId: string;
  onChangeId: (id: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const selectClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white';

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
}: EmployeeSearchSelectProps) => {
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.employeeCode.toLowerCase().includes(q) || e.fullName.toLowerCase().includes(q)
    );
  }, [employees, q]);

  const selected = valueId ? employees.find((e) => e.id === valueId) : undefined;

  return (
    <div className="w-full space-y-2">
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type="search"
        autoComplete="off"
        placeholder={UI_PLACEHOLDER_TEXT.employeeSearch}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        className={selectClass}
      />
      {selected && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Selected:{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {selected.employeeCode} — {selected.fullName}
          </span>
        </p>
      )}
      <select
        className={selectClass}
        value={valueId}
        onChange={(e) => onChangeId(e.target.value)}
        required={required}
        disabled={disabled}
        size={Math.min(10, Math.max(4, filtered.length + 1))}
      >
        <option value="">{UI_FORM_TEXT.chooseEmployee}</option>
        {filtered.map((e) => (
          <option key={e.id} value={e.id}>
            {e.employeeCode} — {e.fullName}
          </option>
        ))}
      </select>
      {q && filtered.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{UI_EMPTY_TEXT.employeesMatchSearch}</p>
      )}
    </div>
  );
};

export default EmployeeSearchSelect;
