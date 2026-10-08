export { LeaveImportHistoryDocument as leaveImportHistoryDocument } from '../../api/graphql/graphql';
export interface ImportedLeaveHistory {
  leave_type_id: string;
  as_of: string;
  historical_lwp: string | null;
  ready: boolean;
  opening: {
    year: number;
    carry_forward: string | null;
    grant: string | null;
    source_taken: string | null;
    source_balance: string | null;
    paid_used: string | null;
    paid_remaining: string | null;
    pending: string | null;
    planned: string | null;
  };
}
