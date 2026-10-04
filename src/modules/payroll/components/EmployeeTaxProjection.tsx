import type { GraphQLClient } from 'graphql-request';
import { useState } from 'react';

import Input from '../../../components/common/Input';
import { useTenant } from '../../../contexts/TenantContext';
import { tenantCalendarPeriod } from '../../../utils/tenantCalendar';
import { useTaxProjection } from '../hooks/useTaxProjection';

import TaxProjectionSummary from './TaxProjectionSummary';
import TaxProjectionTimeline from './TaxProjectionTimeline';
import TaxSalaryMatrix from './TaxSalaryMatrix';
import TaxSlabBreakdown from './TaxSlabBreakdown';

const EmployeeTaxProjection = ({
  client,
  ownerKey,
  employeeId = null,
}: {
  client: GraphQLClient;
  ownerKey: string;
  employeeId?: string | null;
}) => {
  const { currentTenant } = useTenant();
  const current = tenantCalendarPeriod(new Date(), currentTenant.timezone);
  const currentYear = current.year - (current.month < 4 ? 1 : 0);
  const [year, setYear] = useState(currentYear);
  const [reviewMonth, setReviewMonth] = useState(current.month);
  let { month } = current;
  if (year < currentYear) month = 3;
  if (year > currentYear) month = 4;
  if (employeeId) month = reviewMonth;
  const state = useTaxProjection(client, ownerKey, employeeId, year, month);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          label="Financial year"
          type="number"
          min={2000}
          max={2199}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
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
      </div>
      <p className="text-sm text-content-secondary">
        April {year}–March {year + 1}. Earnings are projected from your joining date within this
        financial year using your salary structure. Employer contributions are not take-home
        earnings.
      </p>
      {state.loading && <p role="status">Loading tax projection…</p>}
      {state.error && <p role="alert">{state.error} Contact HR to review your settings.</p>}
      {state.data && (
        <>
          <TaxProjectionSummary projection={state.data} />
          <TaxSalaryMatrix projection={state.data} />
          {state.data.tax && <TaxSlabBreakdown tax={state.data.tax} />}
          <TaxProjectionTimeline projection={state.data} />
        </>
      )}
    </div>
  );
};
export default EmployeeTaxProjection;
