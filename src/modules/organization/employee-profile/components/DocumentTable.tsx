import { Download, Eye, FileText } from 'lucide-react';

import type { DocumentRow } from '../types';
import { DocumentStatusBadge } from './StatusBadge';
import { formatCompactDate } from '../lib/masking';
import Button from '../../../../components/common/Button';

interface DocumentTableProps {
  rows: DocumentRow[];
  isHr: boolean;
  onPreview: (row: DocumentRow) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function DocumentTable({ rows, isHr, onPreview, onApprove, onReject }: DocumentTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm dark:border-slate-700/80">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/90 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Document</th>
            <th className="hidden px-4 py-3 sm:table-cell">Uploaded By</th>
            <th className="hidden px-4 py-3 md:table-cell">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900/40">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" aria-hidden />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{row.name}</p>
                    <p className="text-[11px] text-slate-500">{row.category.replace('_', ' ')}</p>
                  </div>
                </div>
              </td>
              <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 sm:table-cell">
                {row.uploadedBy === 'HR' ? 'HR' : 'Employee'}
              </td>
              <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 md:table-cell">
                {formatCompactDate(row.uploadedAt)}
              </td>
              <td className="px-4 py-3">
                <DocumentStatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap justify-end gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="!px-2"
                    onClick={() => onPreview(row)}
                    aria-label={`Preview ${row.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="!px-2"
                    onClick={() => onPreview(row)}
                    aria-label={`Download ${row.name}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {isHr && row.status === 'PENDING' && row.uploadedBy === 'EMPLOYEE' ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="!px-2 text-xs"
                        onClick={() => onApprove?.(row.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        className="!px-2 text-xs"
                        onClick={() => onReject?.(row.id)}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
