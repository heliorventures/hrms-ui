import type { ReactNode } from 'react';

import DataTable from '../../components/common/DataTable';

import { requestColumns } from './loanColumns';
import { loanTableState } from './loanTableState';
import type { LoanRequest } from './loanTypes';

interface Props {
  rows: LoanRequest[];
  loading: boolean;
  error: string | null;
  actions: (request: LoanRequest) => ReactNode;
}
const LoanRequestTable = ({ rows, loading, error, actions }: Props) => (
  <DataTable
    ariaLabel="Loan requests"
    rows={rows}
    getRowId={(row) => row.id}
    getRowLabel={(row) => row.purpose}
    state={loanTableState(loading, error, rows.length)}
    stateMessage={error ?? undefined}
    columns={requestColumns(actions)}
  />
);
export default LoanRequestTable;
