import type { GraphQLClient } from 'graphql-request';
import { useState } from 'react';

import Input from '../../../components/common/Input';
import { useTaxProjection } from '../hooks/useTaxProjection';

import TaxProjectionSummary from './TaxProjectionSummary';
import TaxProjectionTimeline from './TaxProjectionTimeline';
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
  const [year, setYear] = useState(new Date().getFullYear() - (new Date().getMonth() < 3 ? 1 : 0));
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const state = useTaxProjection(client, ownerKey, employeeId, year, month);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          label="Projection tax year starts in"
          type="number"
          min={2000}
          max={2199}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
        <Input
          label="Withholding month"
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        />
      </div>
      {state.loading && <p role="status">Loading tax projection…</p>}
      {state.error && <p role="alert">{state.error} Contact HR to review your settings.</p>}
      {state.data && (
        <>
          <TaxProjectionSummary projection={state.data} />
          <TaxProjectionTimeline projection={state.data} />
          {state.data.tax && <TaxSlabBreakdown tax={state.data.tax} />}
        </>
      )}
    </div>
  );
};
export default EmployeeTaxProjection;
