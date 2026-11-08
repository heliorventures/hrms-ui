import type { ReactNode } from 'react';

import Button from '../../components/common/Button';
import type { DataTableColumn } from '../../components/common/DataTable';

import type { LoanAccount, LoanRequest } from './loanTypes';

export function accountColumns(
  onOpen: (account: LoanAccount) => void
): DataTableColumn<LoanAccount>[] {
  return [
    {
      id: 'loan',
      header: 'Loan / purpose',
      cell: (row) => (
        <>
          <Button variant="quiet" onClick={() => onOpen(row)}>
            {row.loanNumber}
          </Button>
          <p className="text-xs text-content-secondary">{row.purpose}</p>
        </>
      ),
    },
    {
      id: 'employee',
      header: 'Employee',
      cell: (row) => (
        <>
          {row.employeeName}
          <p className="text-xs text-content-secondary">{row.employeeCode}</p>
        </>
      ),
    },
    {
      id: 'approved',
      header: 'Approved',
      numeric: true,
      cell: (row) => `${row.currency} ${row.approvedPrincipal}`,
    },
    { id: 'funded', header: 'Disbursed', numeric: true, cell: (row) => row.disbursed },
    { id: 'repaid', header: 'Repaid', numeric: true, cell: (row) => row.repaid },
    {
      id: 'outstanding',
      header: 'Posted balance',
      numeric: true,
      cell: (row) => row.outstanding,
    },
    {
      id: 'state',
      header: 'Status',
      cell: (row) => (
        <>
          {row.state}
          <p className="text-xs text-content-secondary">{row.fundingState.replace(/_/g, ' ')}</p>
        </>
      ),
    },
  ];
}
export function requestColumns(
  actions: (request: LoanRequest) => ReactNode
): DataTableColumn<LoanRequest>[] {
  return [
    {
      id: 'employee',
      header: 'Employee',
      cell: (row) => `${row.employeeName} · ${row.employeeCode}`,
    },
    {
      id: 'purpose',
      header: 'Purpose',
      cell: (row) => (
        <>
          {row.purpose}
          <p className="text-xs text-content-secondary">{row.employeeNotes}</p>
        </>
      ),
    },
    {
      id: 'amount',
      header: 'Requested',
      numeric: true,
      cell: (row) => `${row.currency} ${row.requestedAmount}`,
    },
    { id: 'created', header: 'Created', cell: (row) => row.createdAt.slice(0, 10) },
    { id: 'status', header: 'Status', cell: (row) => row.state.replace(/_/g, ' ') },
    {
      id: 'decisionReason',
      header: 'Decision reason',
      cell: (row) => row.decisionReason || '—',
    },
    { id: 'actions', header: 'Actions', cell: actions },
  ];
}
