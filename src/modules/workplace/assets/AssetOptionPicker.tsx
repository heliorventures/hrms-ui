import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

import AssetPager from './AssetPager';
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

type PickerOptionsProps = Pick<
  AssetOptionPickerProps,
  | 'label'
  | 'value'
  | 'options'
  | 'filter'
  | 'pageInfo'
  | 'loading'
  | 'emptyLabel'
  | 'onFilterChange'
> & {
  id: string;
  choose: (option: AssetOption) => void;
};

const PickerOptions = ({
  label,
  value,
  options,
  filter,
  pageInfo,
  loading,
  emptyLabel,
  onFilterChange,
  id,
  choose,
}: PickerOptionsProps) => {
  const [searchDraft, setSearchDraft] = useState(filter.search);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    searchInput.current?.focus();
  }, []);
  useEffect(() => {
    setSearchDraft(filter.search);
  }, [filter.search]);
  const search = () => onFilterChange({ ...filter, page: 1, search: searchDraft.trim() });
  return (
    <div
      id={`${id}-options`}
      role="region"
      aria-label={`${label} options`}
      className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-line bg-surface p-2 shadow-lg"
    >
      <div className="flex items-center gap-1">
        <Input
          ref={searchInput}
          aria-label={`Search ${label.toLowerCase()}`}
          value={searchDraft}
          fullWidth
          placeholder={`Search ${label.toLowerCase()}`}
          onChange={(event) => setSearchDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.stopPropagation();
              search();
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={loading} onClick={search}>
          Search
        </Button>
      </div>
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
          Clear search
        </Button>
      ) : null}
      <div className="mt-2 max-h-48 space-y-1 overflow-y-auto" aria-busy={loading}>
        {[{ value: '', label: emptyLabel }, ...options].map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            disabled={loading && Boolean(option.value)}
            className="block min-h-9 w-full rounded px-2 py-1.5 text-left text-sm text-content-primary hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus aria-pressed:bg-surface-selected disabled:opacity-50"
            onClick={() => choose(option)}
          >
            {option.label}
          </button>
        ))}
        {loading ? (
          <p role="status" className="p-2 text-sm text-content-muted">
            Loading...
          </p>
        ) : null}
        {!loading && options.length === 0 ? (
          <p role="status" className="p-2 text-sm text-content-muted">
            No options found.
          </p>
        ) : null}
      </div>
      {pageInfo.totalPages > 1 ? (
        <AssetPager
          pageInfo={pageInfo}
          loading={loading}
          onPageChange={(page) => onFilterChange({ ...filter, page })}
        />
      ) : null}
    </div>
  );
};

const AssetOptionPicker = ({
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
}: AssetOptionPickerProps) => {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<AssetOption>();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const currentLabel =
    options.find((option) => option.value === value)?.label ??
    (selection?.value === value ? selection.label : selectedLabel) ??
    'Current selection';
  const displayLabel = value ? currentLabel : emptyLabel;

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  const choose = (option: AssetOption) => {
    setSelection(option);
    onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div
      ref={container}
      role="group"
      aria-label={label}
      className="relative w-full min-w-0 sm:w-64"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDownCapture={(event) => {
        if (open && event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-label={`${label}: ${displayLabel}${required ? ' (required)' : ''}`}
        aria-describedby={error ? `${id}-error` : undefined}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-left text-sm text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:min-h-9"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">
          {displayLabel}
          {required ? ' *' : ''}
        </span>
        <ChevronDown size={16} className="shrink-0" aria-hidden="true" />
      </button>
      {open ? (
        <PickerOptions
          label={label}
          value={value}
          options={options}
          filter={filter}
          pageInfo={pageInfo}
          loading={loading}
          emptyLabel={emptyLabel}
          onFilterChange={onFilterChange}
          id={id}
          choose={choose}
        />
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default AssetOptionPicker;
