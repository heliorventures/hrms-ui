import type { GraphQLClient } from 'graphql-request';

import Card from '../../../components/common/Card';
import FeedbackToast from '../../../components/common/FeedbackToast';
import { useCompanyPayslipComponents } from '../hooks/useCompanyPayslipComponents';

const CompanyPayslipComponents = ({ client }: { client: GraphQLClient }) => {
  const { rows, error, busy, loading, change } = useCompanyPayslipComponents(client);
  return (
    <Card>
      <p className="mb-3 text-sm text-slate-600">
        Choose the components shown on payslips for every employee in this company. Gross,
        deductions and net earnings keep their calculated values.
      </p>
      {loading && <p role="status">Loading components...</p>}
      {error && (
        <FeedbackToast variant={'error'} messageKey={error}>
          {error}
        </FeedbackToast>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <label
            key={row.id}
            className="flex items-center gap-2 rounded border border-slate-200 p-3 text-sm"
          >
            <input
              type="checkbox"
              checked={row.showOnPayslip}
              disabled={loading || busy !== null}
              onChange={(event) => void change(row, event.target.checked)}
            />
            <span>
              {row.name} <span className="text-slate-500">({row.componentType})</span>
            </span>
          </label>
        ))}
      </div>
    </Card>
  );
};
export default CompanyPayslipComponents;
