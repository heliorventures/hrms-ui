import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { downloadReportCsv } from './downloadReportCsv';
import {
  HrReportCsvDocument,
  HrReportRowsDocument,
  type ReportCsv,
  type ReportFilter,
  type ReportRows,
} from './reportDocuments';

const reportRowKeys = (rows: string[][]) => {
  const occurrences = new Map<string, number>();
  return rows.map((row) => {
    const identity = JSON.stringify(row);
    const occurrence = occurrences.get(identity) ?? 0;
    occurrences.set(identity, occurrence + 1);
    return { row, key: `${identity}|${occurrence}` };
  });
};

const ReportTable = ({ data }: { data: ReportRows }) => (
  <div className="overflow-x-auto rounded-lg border border-line">
    <table className="w-full text-left text-sm">
      <thead className="bg-surface-muted">
        <tr>
          {data.columns.map((column) => (
            <th key={column} scope="col" className="whitespace-nowrap px-3 py-2 font-medium">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {reportRowKeys(data.rows).map(({ row, key }) => (
          <tr key={key} className="border-t border-line">
            {row.map((cell, column) => (
              <td
                key={data.columns[column]}
                className="max-w-sm whitespace-pre-wrap break-words px-3 py-2"
              >
                {cell || '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {data.rows.length === 0 && (
      <p className="p-4 text-sm text-content-secondary">No records match this report and period.</p>
    )}
  </div>
);

const useReportExport = (filter: ReportFilter) => {
  const client = useGraphClient('client');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exported, setExported] = useState<number | null>(null);
  const alive = useRef(true);
  const exportRequest = useRef<object | null>(null);
  const current = useRef({ client, filter });
  current.current = { client, filter };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    exportRequest.current = null;
    setExporting(false);
    setExportError(null);
    setExported(null);
  }, [client, filter]);
  const exportCsv = async () => {
    if (exportRequest.current) return;
    const request = {};
    exportRequest.current = request;
    setExporting(true);
    setExportError(null);
    setExported(null);
    const owns = () =>
      alive.current &&
      current.current.client === client &&
      current.current.filter === filter &&
      exportRequest.current === request;
    try {
      const result = await client.request<{ hrReportCsv: ReportCsv }>(HrReportCsvDocument, {
        ...filter,
      });
      if (!owns()) return;
      downloadReportCsv(result.hrReportCsv.fileName, result.hrReportCsv.csv);
      setExported(result.hrReportCsv.rowCount);
    } catch (error) {
      if (owns()) setExportError(graphQlUserMessage(error));
    } finally {
      if (owns()) {
        exportRequest.current = null;
        setExporting(false);
      }
    }
  };
  return { exporting, exportError, exported, exportCsv };
};

const ReportPagination = ({
  page,
  setPage,
  totalRows,
  busy,
}: {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalRows: number;
  busy: boolean;
}) => (
  <div className="flex items-center justify-end gap-3">
    <Button
      size="sm"
      variant="quiet"
      disabled={page === 0 || busy}
      onClick={() => setPage((value) => value - 1)}
    >
      Previous
    </Button>
    <span className="text-xs">Page {page + 1}</span>
    <Button
      size="sm"
      variant="quiet"
      disabled={(page + 1) * 50 >= totalRows || busy}
      onClick={() => setPage((value) => value + 1)}
    >
      Next
    </Button>
  </div>
);

const ReportResult = ({ filter }: { filter: ReportFilter }) => {
  const client = useGraphClient('client');
  const [page, setPage] = useState(0);
  const { exporting, exportError, exported, exportCsv } = useReportExport(filter);
  const load = useCallback(
    () =>
      client.request<{ hrReportRows: ReportRows }>(HrReportRowsDocument, {
        ...filter,
        offset: page * 50,
      }),
    [client, filter, page]
  );
  const query = useRetainedQuery(load);
  const busy = query.phase === 'initial-loading' || query.phase === 'refreshing';
  const data = query.data?.hrReportRows;
  const retry = exportError ? exportCsv : query.refresh;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-content-secondary">
          {data ? `${data.totalRows.toLocaleString()} records` : 'Report preview'}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              void query.refresh();
            }}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            busy={exporting}
            busyLabel="Preparing CSV…"
            onClick={() => {
              void exportCsv();
            }}
          >
            Download CSV
          </Button>
        </div>
      </div>
      {(query.error || exportError) && (
        <div role="alert" className="flex items-center gap-3 text-sm text-status-danger">
          {exportError || query.error}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void retry();
            }}
          >
            Retry
          </Button>
        </div>
      )}
      {busy && (
        <p role="status" className="text-sm text-content-secondary">
          Loading report…
        </p>
      )}
      {exported !== null && (
        <p role="status" className="text-sm text-content-secondary">
          CSV prepared with all {exported.toLocaleString()} matching records.
        </p>
      )}
      {data && (
        <>
          <ReportTable data={data} />
          <ReportPagination page={page} setPage={setPage} totalRows={data.totalRows} busy={busy} />
        </>
      )}
    </div>
  );
};
export default ReportResult;
