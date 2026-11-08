import DataTable from '../../components/common/DataTable';

import { accountColumns } from './loanColumns';
import { loanTableState } from './loanTableState';
import type { LoanAccount } from './loanTypes';

interface Props {
  rows: LoanAccount[];
  loading: boolean;
  error: string | null;
  onOpen: (account: LoanAccount) => void;
}
const LoanAccountTable = ({ rows, loading, error, onOpen }: Props) => (
  <DataTable
    ariaLabel="Loan accounts"
    rows={rows}
    getRowId={(row) => row.id}
    getRowLabel={(row) => row.loanNumber}
    state={loanTableState(loading, error, rows.length)}
    stateMessage={error ?? undefined}
    columns={accountColumns(onOpen)}
  />
);
export default LoanAccountTable;
