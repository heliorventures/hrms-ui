// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HrReportCsvDocument, HrReportRowsDocument, type ReportFilter } from './reportDocuments';
import ReportResult from './ReportResult';

const state = vi.hoisted(() => ({ client: { request: vi.fn() }, download: vi.fn() }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('./downloadReportCsv', () => ({ downloadReportCsv: state.download }));
beforeEach(() => {
  state.client = { request: vi.fn() };
  state.download.mockClear();
});
afterEach(cleanup);
const filter: ReportFilter = {
  kind: 'LEAVE_REQUESTS',
  fromDate: '2026-09-01',
  toDate: '2026-09-30',
  employeeSearch: 'Asha',
};
const preview = {
  hrReportRows: { columns: ['Employee', 'Status'], rows: [['Asha', 'APPROVED']], totalRows: 251 },
};

describe('complete report exports', () => {
  it('downloads the full server CSV independently of the displayed page', async () => {
    state.client.request.mockImplementation((document: unknown) =>
      Promise.resolve(
        document === HrReportRowsDocument
          ? preview
          : { hrReportCsv: { fileName: 'leave.csv', csv: 'all 251 rows', rowCount: 251 } }
      )
    );
    render(<ReportResult filter={filter} />);
    expect(await screen.findByText('Asha')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(state.download).toHaveBeenCalledWith('leave.csv', 'all 251 rows'));
    expect(state.client.request).toHaveBeenCalledWith(HrReportCsvDocument, filter);
    expect(screen.getByText('CSV prepared with all 251 matching records.')).toBeTruthy();
  });
  it('never downloads a delayed export from the previous client', async () => {
    let finish!: (value: unknown) => void;
    state.client.request.mockImplementation((document: unknown) =>
      document === HrReportRowsDocument
        ? Promise.resolve(preview)
        : new Promise((resolve) => {
            finish = resolve;
          })
    );
    const view = render(<ReportResult filter={filter} />);
    await screen.findByText('Asha');
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    state.client = {
      request: vi.fn().mockResolvedValue({
        hrReportRows: { columns: ['Employee'], rows: [['New account']], totalRows: 1 },
      }),
    };
    view.rerender(<ReportResult filter={filter} />);
    await screen.findByText('New account');
    await act(() =>
      Promise.resolve(
        finish({ hrReportCsv: { fileName: 'old.csv', csv: 'old data', rowCount: 251 } })
      )
    );
    expect(state.download).not.toHaveBeenCalled();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Download CSV' }).disabled).toBe(
      false
    );
  });
});
