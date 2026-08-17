import { type FormEvent, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

interface AssetSectionToolbarProps {
  search: string;
  placeholder: string;
  loading: boolean;
  actionLabel?: string;
  onSearch: (search: string) => void;
  onAction?: () => void;
  children?: React.ReactNode;
}

export default function AssetSectionToolbar({
  search,
  placeholder,
  loading,
  actionLabel,
  onSearch,
  onAction,
  children,
}: AssetSectionToolbarProps) {
  const [draft, setDraft] = useState(search);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(draft.trim());
  };
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <form onSubmit={submit} className="flex min-w-64 flex-1 items-end gap-2">
        <Input
          label="Search"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          className="w-full"
        />
        <Button type="submit" variant="outline" disabled={loading}>
          Search
        </Button>
        {search ? (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => {
              setDraft('');
              onSearch('');
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>
      {children}
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
