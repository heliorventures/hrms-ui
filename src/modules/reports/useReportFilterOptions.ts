import { useRef } from 'react';

interface Option {
  id: string;
  name: string;
}
interface Options {
  departments: Option[];
  locations: Option[];
  expenseCategories: Option[];
}
type Group = keyof Options;

/** Preserve a selected name while the user searches other available options. */
export const useReportFilterOptions = (options: Options | undefined) => {
  const seen = useRef<Record<Group, Map<string, string>>>({
    departments: new Map(),
    locations: new Map(),
    expenseCategories: new Map(),
  });
  for (const group of ['departments', 'locations', 'expenseCategories'] as const) {
    for (const row of options?.[group] ?? []) seen.current[group].set(row.id, row.name);
  }
  return (group: Group, selected?: string | null) => {
    const rows = options?.[group] ?? [];
    const result = [
      { value: '', label: 'All' },
      ...rows.map((row) => ({ value: row.id, label: row.name })),
    ];
    const name = selected ? seen.current[group].get(selected) : undefined;
    if (selected && name && !rows.some((row) => row.id === selected))
      result.push({ value: selected, label: name });
    return result;
  };
};
