import { useMemo, useState } from 'react';
import { UI_EMPTY_TEXT, UI_FORM_TEXT, UI_PLACEHOLDER_TEXT } from '../../constants/uiText';

export type UuidEntityOption = {
  id: string;
  /** Primary line in the list and “Selected” summary */
  title: string;
  /** Optional second line (code, department, description snippet, etc.) */
  subtitle?: string;
};

interface UuidEntitySearchSelectProps {
  label: string;
  placeholder?: string;
  emptyLabel?: string;
  options: UuidEntityOption[];
  valueId: string;
  onChangeId: (id: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const controlClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white';

/**
 * Searchable picker for GraphQL entities keyed by UUID (`id`).
 * Mirrors the searchable list + `<select>` pattern used by `EmployeeSearchSelect`.
 */
const UuidEntitySearchSelect = ({
  label,
  placeholder = UI_PLACEHOLDER_TEXT.uuidEntitySearch,
  emptyLabel = UI_FORM_TEXT.chooseAny,
  options,
  valueId,
  onChangeId,
  required,
  disabled,
}: UuidEntitySearchSelectProps) => {
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return options;
    return options.filter((o) => {
      const t = o.title.toLowerCase();
      const s = (o.subtitle ?? '').toLowerCase();
      const idq = o.id.toLowerCase();
      return t.includes(q) || s.includes(q) || idq.includes(q);
    });
  }, [options, q]);

  const selected = valueId ? options.find((o) => o.id === valueId) : undefined;

  return (
    <div className="w-full space-y-2">
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        className={controlClass}
      />
      {selected && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Selected:{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{selected.title}</span>
          {selected.subtitle ? (
            <span className="text-gray-500 dark:text-gray-400"> — {selected.subtitle}</span>
          ) : null}
        </p>
      )}
      <select
        className={controlClass}
        value={valueId}
        onChange={(e) => onChangeId(e.target.value)}
        required={required}
        disabled={disabled}
        size={Math.min(10, Math.max(4, filtered.length + 1))}
      >
        <option value="">{emptyLabel}</option>
        {filtered.map((o) => (
          <option key={o.id} value={o.id}>
            {o.subtitle ? `${o.title} — ${o.subtitle}` : o.title}
          </option>
        ))}
      </select>
      {q && filtered.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{UI_EMPTY_TEXT.matchesTryAnotherSearch}</p>
      )}
    </div>
  );
};

export default UuidEntitySearchSelect;
