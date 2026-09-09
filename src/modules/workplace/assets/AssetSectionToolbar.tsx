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

const AssetSectionToolbar = ({
  search,
  placeholder,
  loading,
  actionLabel,
  onSearch,
  onAction,
  children,
}: AssetSectionToolbarProps) => {
  const [draft, setDraft] = useState(search);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(draft.trim());
  };
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <form
        onSubmit={submit}
        className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:min-w-72 sm:flex-1"
      >
        <Input
          aria-label="Search"
          fullWidth
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          className="w-full"
        />
        <Button type="submit" variant="outline" size="sm" disabled={loading}>
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
};

export default AssetSectionToolbar;
