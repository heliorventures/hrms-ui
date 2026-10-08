import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import { TaxSettingsEmployeesDocument } from '../../../api/graphql/graphql';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { useEmployeeTaxSettings } from '../hooks/useEmployeeTaxSettings';

import EmployeeTaxSettings from './EmployeeTaxSettings';
import TaxHistoryEditor from './TaxHistoryEditor';

const EmployeeForms = ({
  client,
  employeeId,
  year,
}: {
  client: GraphQLClient;
  employeeId: string;
  year: number;
}) => {
  const state = useEmployeeTaxSettings(client, employeeId, year);
  const [historyId, setHistoryId] = useState('');
  const latest = state.settings.reduce<(typeof state.settings)[number] | null>(
    (selected, item) => (!selected || item.revision > selected.revision ? item : selected),
    null
  );
  const correction = state.history.find((row) => row.id === historyId);
  return (
    <div className="space-y-6">
      {state.error && (
        <p role="alert" className="text-red-700">
          {state.error}
        </p>
      )}
      {state.busy ? (
        <p role="status">Loading tax settings…</p>
      ) : (
        <>
          <EmployeeTaxSettings
            key={latest?.revision ?? 'new'}
            current={latest}
            busy={state.busy}
            onSave={(input) => void state.save('settings', input, latest?.revision ?? null)}
          />
          <h3 className="font-semibold">
            Recorded history for April {year}–March {year + 1}
          </h3>
          {state.history.length === 0 && <p>No earlier history provided.</p>}
          {state.history.map((row) => (
            <div className="flex flex-wrap items-center gap-3 rounded border p-3" key={row.id}>
              <span>
                {row.entry.period_start}–{row.entry.period_end} · {row.entry.source_key} · TDS{' '}
                {row.entry.tds ?? 'Not provided'} ·{' '}
                {row.entry.coverage === 'COMPLETE' ? 'Complete coverage' : 'Incomplete coverage'}
              </span>
              <Button variant="outline" onClick={() => setHistoryId(row.id)}>
                Correct history
              </Button>
            </div>
          ))}
          {correction && (
            <Button variant="outline" onClick={() => setHistoryId('')}>
              Add another period
            </Button>
          )}
          <TaxHistoryEditor
            key={`${historyId}:${correction?.revision ?? 0}`}
            initial={correction?.entry}
            busy={state.busy}
            onSave={(input) => void state.save('history', input, correction?.revision ?? null)}
          />
        </>
      )}
    </div>
  );
};
const EmployeeTaxWorkspace = ({ client }: { client: GraphQLClient }) => {
  const [employees, setEmployees] = useState<
    { id: string; fullName: string; employeeCode: string }[]
  >([]);
  const [employee, setEmployee] = useState('');
  const [year, setYear] = useState(new Date().getFullYear() - (new Date().getMonth() < 3 ? 1 : 0));
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void client
      .request<{ employees: typeof employees }>(TaxSettingsEmployeesDocument)
      .then((value) => {
        if (active) setEmployees(value.employees);
      })
      .catch((cause: unknown) => {
        if (active) setError(graphQlUserMessage(cause));
      });
    return () => {
      active = false;
    };
  }, [client]);
  return (
    <Card title="Employee tax and recorded history">
      {error && <p role="alert">{error}</p>}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <label>
          Employee
          <select
            className="block w-full rounded border p-2"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option value="">Select employee</option>
            {employees.map((row) => (
              <option key={row.id} value={row.id}>
                {row.employeeCode} — {row.fullName}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Tax year starts in"
          type="number"
          min={2000}
          max={2199}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>
      {employee && (
        <EmployeeForms
          key={`${employee}:${year}`}
          client={client}
          employeeId={employee}
          year={year}
        />
      )}
    </Card>
  );
};
export default EmployeeTaxWorkspace;
