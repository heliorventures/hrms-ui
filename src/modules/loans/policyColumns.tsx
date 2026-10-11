import type { LoanPolicyVersionsQuery } from '../../api/loans/graphql';
import Button from '../../components/common/Button';
import type { DataTableColumn } from '../../components/common/DataTable';

type Policy = LoanPolicyVersionsQuery['loanPolicyVersions']['nodes'][number];
export function policyColumns(
  onVersion: (row: Policy) => void,
  onRetire: (row: Policy) => void
): DataTableColumn<Policy>[] {
  return [
    { id: 'key', header: 'Policy', cell: (row) => row.key },
    { id: 'version', header: 'Version', cell: (row) => row.version },
    { id: 'currency', header: 'Currency', cell: (row) => row.currency },
    { id: 'from', header: 'Effective from', cell: (row) => row.effectiveFrom },
    { id: 'to', header: 'Effective to', cell: (row) => row.effectiveTo ?? 'Open ended' },
    { id: 'state', header: 'Status', cell: (row) => row.status },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => onVersion(row)}>
            Review new version
          </Button>
          {row.status === 'ACTIVE' && (
            <Button variant="quiet" onClick={() => onRetire(row)}>
              Retire
            </Button>
          )}
        </div>
      ),
    },
  ];
}
