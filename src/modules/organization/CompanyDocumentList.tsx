import ActionMenu from '../../components/common/ActionMenu';
import Badge from '../../components/common/Badge';

import {
  COMPANY_DOCUMENT_CATEGORIES,
  type CompanyDocumentActions,
  type CompanyDocumentRow,
} from './companyDocumentTypes';

interface RowProps extends CompanyDocumentActions {
  row: CompanyDocumentRow;
  selected: boolean;
  onSelect: (id: string) => void;
}

const DocumentItem = ({
  row,
  selected,
  onSelect,
  canManage,
  busy,
  onDownload,
  onDelete,
}: RowProps) => (
  <li
    className={`rounded-xl border p-4 ${selected ? 'border-accent bg-surface-selected' : 'border-line bg-surface'}`}
  >
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(row.id)}
      className="block w-full rounded text-left focus-visible:ring-2 focus-visible:ring-focus"
    >
      <span className="block break-words text-base font-semibold">{row.title}</span>
      <span className="mt-2 block text-xs text-content-secondary">
        {COMPANY_DOCUMENT_CATEGORIES.find((item) => item.value === row.category)?.label ??
          row.category}
        {' · '}
        {new Date(row.updatedAt).toLocaleDateString()}
      </span>
      {row.description ? (
        <span className="mt-2 block break-words text-sm text-content-secondary">
          {row.description}
        </span>
      ) : null}
      <span className="mt-3 block text-sm font-semibold text-accent">
        {selected ? 'Reading now' : 'Read document →'}
      </span>
    </button>
    <div className="mt-3 flex items-center justify-between gap-2">
      <span>{!row.visibleToEmployees ? <Badge variant="info">Hidden</Badge> : null}</span>
      <ActionMenu
        label={`Actions for ${row.title}`}
        items={[
          { id: 'download', label: 'Download', onSelect: () => void onDownload(row) },
          ...(canManage
            ? [
                {
                  id: 'delete',
                  label: 'Delete document',
                  tone: 'danger' as const,
                  disabled: busy,
                  onSelect: () => void onDelete(row),
                },
              ]
            : []),
        ]}
      />
    </div>
  </li>
);

interface Props extends CompanyDocumentActions {
  documents: CompanyDocumentRow[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const CompanyDocumentList = ({ documents, selectedId, ...actions }: Props) => (
  <div className="space-y-3">
    <p className="text-xs text-content-muted">{documents.length} documents shown</p>
    <ul className="space-y-3">
      {documents.map((row) => (
        <DocumentItem key={row.id} row={row} selected={selectedId === row.id} {...actions} />
      ))}
    </ul>
  </div>
);

export default CompanyDocumentList;
