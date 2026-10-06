import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import Card from '../../../components/common/Card';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

interface DisplayComponent {
  id: string;
  name: string;
  componentType: string;
  showOnPayslip: boolean;
}
const query = /* GraphQL */ `
  query CompanyPayslipComponents {
    salaryComponents(limit: 500) {
      id
      name
      componentType
      showOnPayslip
    }
  }
`;
const mutation = /* GraphQL */ `
  mutation SetSalaryComponentPayslipVisibility($componentId: ID!, $visible: Boolean!) {
    setSalaryComponentPayslipVisibility(componentId: $componentId, visible: $visible)
  }
`;

const CompanyPayslipComponents = ({ client }: { client: GraphQLClient }) => {
  const [rows, setRows] = useState<DisplayComponent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    client
      .request<{ salaryComponents: DisplayComponent[] }>(query)
      .then((result) => {
        if (active) {
          setRows(result.salaryComponents);
          setLoading(false);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(graphQlUserMessage(reason));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [client]);
  const change = async (row: DisplayComponent, visible: boolean) => {
    setBusy(row.id);
    setError(null);
    try {
      await client.request(mutation, { componentId: row.id, visible });
      setRows((current) =>
        current.map((item) => (item.id === row.id ? { ...item, showOnPayslip: visible } : item))
      );
    } catch (reason) {
      setError(graphQlUserMessage(reason));
    } finally {
      setBusy(null);
    }
  };
  return (
    <Card>
      <p className="mb-3 text-sm text-slate-600">
        Choose the components shown on payslips for every employee in this company. Gross,
        deductions and net earnings keep their calculated values.
      </p>
      {loading && <p role="status">Loading components...</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
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
              disabled={busy !== null}
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
