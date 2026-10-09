import { useEffect, useState } from 'react';

import Button from '../../components/common/Button';
import FeedbackToast from '../../components/common/FeedbackToast';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

import CompanyDocumentList from './CompanyDocumentList';
import CompanyDocumentReader from './CompanyDocumentReader';
import {
  COMPANY_DOCUMENT_CATEGORIES,
  type CompanyDocumentRow,
  type CompanyDocumentActions,
} from './companyDocumentTypes';

type DocumentRow = CompanyDocumentRow;
interface Props extends CompanyDocumentActions {
  documents: DocumentRow[];
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}

const categories = [{ value: '', label: 'All categories' }, ...COMPANY_DOCUMENT_CATEGORIES];

const useWideLibrary = () => {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1280px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1280px)');
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return wide;
};

interface StateProps extends Pick<Props, 'loading' | 'failed' | 'onRetry'> {
  count: number;
  filtered: boolean;
  onClear: () => void;
}
const LibraryState = ({ loading, failed, onRetry, count, filtered, onClear }: StateProps) => (
  <>
    {loading ? (
      <p role="status" className="text-sm">
        Loading documents…
      </p>
    ) : null}
    {!loading && failed ? (
      <FeedbackToast
        variant={'error'}
        action={
          <>
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </>
        }
      >
        <p>Documents could not be loaded.</p>
      </FeedbackToast>
    ) : null}
    {!loading && !failed && !count ? (
      <div
        role="status"
        className="rounded-lg border border-line p-6 text-sm text-content-secondary"
      >
        <p>
          {filtered
            ? 'No documents match your filters.'
            : 'No company documents have been published yet.'}
        </p>
        {filtered ? (
          <Button variant="quiet" onClick={onClear}>
            Clear filters
          </Button>
        ) : null}
      </div>
    ) : null}
  </>
);

const CompanyDocumentLibrary = ({
  documents,
  loading,
  busy,
  failed,
  canManage,
  onRetry,
  onDelete,
  onDownload,
}: Props) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const wide = useWideLibrary();
  const matches = documents.filter(
    (row) =>
      (!category || row.category === category) &&
      row.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  );
  const selected = matches.find((row) => row.id === selectedId);
  const clear = () => {
    setSearch('');
    setCategory('');
  };
  return (
    <section aria-label="Company document library" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Input
            fullWidth
            label="Search document titles"
            placeholder="Find a policy or resource…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select
          label="Category"
          options={categories}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </div>
      {documents.length >= 100 ? (
        <p role="status" className="text-sm text-content-secondary">
          Showing up to 100 documents. Contact HR if you cannot find a policy.
        </p>
      ) : null}
      <LibraryState
        loading={loading}
        failed={failed}
        onRetry={onRetry}
        count={matches.length}
        filtered={Boolean(search || category)}
        onClear={clear}
      />
      {!loading && !failed && matches.length > 0 ? (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(18rem,1fr)_minmax(0,2fr)]">
          <CompanyDocumentList
            documents={matches}
            selectedId={selected?.id}
            onSelect={setSelectedId}
            busy={busy}
            canManage={canManage}
            onDownload={onDownload}
            onDelete={onDelete}
          />
          {selected ? (
            <CompanyDocumentReader
              key={selected.id}
              documentId={selected.id}
              title={selected.title}
              onClose={() => setSelectedId(null)}
              presentation={wide ? 'inline' : 'dialog'}
            />
          ) : (
            <p className="hidden rounded-xl border border-line bg-surface p-8 text-sm text-content-secondary xl:block">
              Select a document to read it here.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default CompanyDocumentLibrary;
