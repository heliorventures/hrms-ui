// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PrejoiningPipelineExport, {
  PrejoiningPipelineCsvDocument,
} from './PrejoiningPipelineExport';

const state = vi.hoisted(() => ({
  client: { request: vi.fn() },
  allowed: true,
  download: vi.fn(),
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../reports/useReportOwner', () => ({ useReportOwner: () => 'tenant-a:reviewer' }));
vi.mock('../reports/downloadReportCsv', () => ({ downloadReportCsv: state.download }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      jwtRoles: [],
      persona: 'HR',
      mustChangePassword: false,
      permissions: new Set(state.allowed ? ['prejoining:review'] : []),
      permissionScopes: { 'prejoining:review': 'ALL' },
      resourceScopes: {},
    },
  }),
}));
beforeEach(() => {
  state.client = {
    request: vi.fn().mockResolvedValue({ prejoiningCandidatesCsv: 'full server CSV' }),
  };
  state.allowed = true;
  state.download.mockClear();
});
afterEach(cleanup);

describe('candidate pipeline export', () => {
  it('exports the server dataset for the status without applying UI pagination', async () => {
    render(<PrejoiningPipelineExport status="SUBMITTED" />);
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() =>
      expect(state.download).toHaveBeenCalledWith('prejoining-candidates.csv', 'full server CSV')
    );
    expect(state.client.request).toHaveBeenCalledWith(PrejoiningPipelineCsvDocument, {
      status: 'SUBMITTED',
    });
  });
  it('never downloads a previous client response after an account refresh', async () => {
    let finish!: (result: unknown) => void;
    state.client.request.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const view = render(<PrejoiningPipelineExport status="" />);
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    state.client = { request: vi.fn() };
    view.rerender(<PrejoiningPipelineExport status="" />);
    await act(() => Promise.resolve(finish({ prejoiningCandidatesCsv: 'old candidate data' })));
    expect(state.download).not.toHaveBeenCalled();
  });
  it('does not expose or request an export without review permission', () => {
    state.allowed = false;
    render(<PrejoiningPipelineExport status="" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(state.client.request).not.toHaveBeenCalled();
  });
});
