import { type FormEvent, useEffect, useMemo, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import type { AssetPageInfo, PageFilter } from './assetTypes';

interface AssetOption {
  value: string;
  label: string;
}

interface AssetOptionPickerProps {
  label: string;
  value: string;
  options: AssetOption[];
  filter: PageFilter;
  pageInfo: AssetPageInfo;
  loading: boolean;
  error?: string | null;
  emptyLabel: string;
  selectedLabel?: string;
  required?: boolean;
  onChange: (value: string) => void;
  onFilterChange: (filter: PageFilter) => void;
}

export default function AssetOptionPicker({
  label,
  value,
  options,
  filter,
  pageInfo,
  loading,
  error,
  emptyLabel,
  selectedLabel,
  required,
  onChange,
  onFilterChange,
}: AssetOptionPickerProps) {
  const [searchDraft, setSearchDraft] = useState(filter.search);

  useEffect(() => {
    setSearchDraft(filter.search);
  }, [filter.search]);

  const selectOptions = useMemo(() => {
    const selectedOption = options.find((option) => option.value === value);
    return [
      { value: '', label: emptyLabel },
      ...(value && !selectedOption
        ? [{ value, label: selectedLabel ?? 'Current selection' }]
        : []),
      ...options,
    ];
  }, [emptyLabel, options, selectedLabel, value]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    onFilterChange({ ...filter, page: 1, search: searchDraft.trim() });
  };

  return (
    <div className="space-y-2">
      <Select
        label={label}
        value={value}
        options={selectOptions}
        error={error ?? undefined}
        required={required}
        fullWidth
        disabled={loading}
        onChange={(event) => onChange(event.target.value)}
      />
      <form className="flex flex-wrap items-end gap-2" onSubmit={submitSearch}>
        <Input
          aria-label={`Search ${label.toLowerCase()}`}
          value={searchDraft}
          placeholder={`Search ${label.toLowerCase()}`}
          disabled={loading}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <Button type="submit" variant="outline" size="sm" disabled={loading}>
          Search
        </Button>
        {filter.search ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => {
              setSearchDraft('');
              onFilterChange({ ...filter, page: 1, search: '' });
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>
      {pageInfo.totalCount > 0 ? (
        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span>
            Page {pageInfo.currentPage} of {Math.max(pageInfo.totalPages, 1)} · {pageInfo.totalCount}{' '}
            options
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || !pageInfo.hasPrevPage}
              onClick={() => onFilterChange({ ...filter, page: pageInfo.currentPage - 1 })}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || !pageInfo.hasNextPage}
              onClick={() => onFilterChange({ ...filter, page: pageInfo.currentPage + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
