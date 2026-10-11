import type { DataTableState } from '../../components/common/DataTable';

export function loanTableState(
  loading: boolean,
  error: string | null,
  count: number
): DataTableState | undefined {
  if (loading) return 'loading';
  if (error) return count > 0 ? 'partial' : 'error';
  return undefined;
}
