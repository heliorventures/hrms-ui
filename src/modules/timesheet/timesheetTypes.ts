export type PeriodMode = 'week' | 'month' | 'custom';

export interface EntryRow {
  id: string;
  workDate: string;
  hoursWorked: string;
  projectCode?: string | null;
  description?: string | null;
  status: string;
  batchId?: string | null;
}
