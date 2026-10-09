import type { GraphQLClient } from 'graphql-request';
import { useState } from 'react';

import FeedbackToast from '../../../components/common/FeedbackToast';
import Input from '../../../components/common/Input';
import { useTenant } from '../../../contexts/TenantContext';
import { tenantCalendarPeriod } from '../../../utils/tenantCalendar';
import { useTaxProjection } from '../hooks/useTaxProjection';

import PayrollHelp from './PayrollHelp';
import TaxProjectionSummary from './TaxProjectionSummary';
import TaxProjectionTimeline from './TaxProjectionTimeline';
import TaxSalaryMatrix from './TaxSalaryMatrix';
import TaxSlabBreakdown from './TaxSlabBreakdown';

function projectionMonth(year: number, currentYear: number, currentMonth: number): number {
  if (year < currentYear) return 3;
  if (year > currentYear) return 4;
  return currentMonth;
}

const EmployeeTaxProjection = ({
  client,
  ownerKey,
  employeeId = null,
  fiscalYear,
  onFiscalYearChange,
}: {
  client: GraphQLClient;
  ownerKey: string;
  employeeId?: string | null;
  fiscalYear?: number;
  onFiscalYearChange?: (year: number) => void;
}) => {
  const { currentTenant } = useTenant();
  const current = tenantCalendarPeriod(new Date(), currentTenant.timezone);
  const currentYear = current.year - (current.month < 4 ? 1 : 0);
  const [localYear, setLocalYear] = useState(currentYear);
  const year = fiscalYear ?? localYear;
  const setYear = onFiscalYearChange ?? setLocalYear;
  const [reviewMonth, setReviewMonth] = useState(current.month);
  const month = employeeId ? reviewMonth : projectionMonth(year, currentYear, current.month);
  const state = useTaxProjection(client, ownerKey, employeeId, year, month);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            label="Financial year"
            type="number"
            min={2000}
            max={2199}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
        {employeeId && (
          <Input
            label="Withholding month"
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setReviewMonth(Number(e.target.value))}
          />
        )}
        <p className="pb-2 text-sm text-content-secondary">
          April {year}–March {year + 1}
        </p>
        <PayrollHelp label="About annual tax projections">
          Earnings are projected from your joining date within the financial year using regular
          salary. Employer contributions are excluded from salary income. Recorded deductions and
          estimates are shown separately.
        </PayrollHelp>
      </div>
      {state.loading && <p role="status">Loading tax projection…</p>}
      {state.error && (
        <FeedbackToast variant={'error'} messageKey={state.error}>
          {state.error} Contact HR to review your settings.
        </FeedbackToast>
      )}
      {state.data && (
        <>
          <div className="grid items-start gap-3 xl:grid-cols-2">
            <TaxProjectionSummary projection={state.data} />
            {state.data.tax && <TaxSlabBreakdown tax={state.data.tax} />}
          </div>
          <TaxSalaryMatrix projection={state.data} />
          <details className="rounded-lg border border-line p-3">
            <summary className="cursor-pointer text-sm font-semibold">
              Month by month records and projections
            </summary>
            <div className="mt-3">
              <TaxProjectionTimeline projection={state.data} />
            </div>
          </details>
        </>
      )}
    </div>
  );
};
export default EmployeeTaxProjection;
