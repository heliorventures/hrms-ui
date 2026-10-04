import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type { PeriodInput } from '../periodInputTypes';

import { EmployeeEligibilityFields } from './EmployeeEligibilityFields';

type Eligibility = NonNullable<PeriodInput['automatic']>['eligibility'];
interface Setting {
  effective_from: string;
  eligibility: Eligibility;
  reason: string;
  revision: string | null;
}
const emptyEligibility: Eligibility = {
  pf_applicable: null,
  esi_applicable: null,
  disability: null,
  esi_continuation_until: null,
  average_daily_wage: null,
};

const EmployeeEligibilityEditor = ({
  client,
  employeeId,
  date,
}: {
  client: GraphQLClient;
  employeeId: string;
  date: string;
}) => {
  const [setting, setSetting] = useState<Setting>({
    effective_from: date,
    eligibility: emptyEligibility,
    reason: '',
    revision: null,
  });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    void client
      .request<{ employeePayrollEligibility: Setting | null }>(
        'query EmployeePayrollEligibility($employeeId:ID!,$asOf:NaiveDate!){employeePayrollEligibility(employeeId:$employeeId,asOf:$asOf)}',
        { employeeId, asOf: date }
      )
      .then((result) => {
        if (active && result.employeePayrollEligibility) {
          setSetting({ ...result.employeePayrollEligibility, effective_from: date });
          setNotice(
            `Previously effective from ${result.employeePayrollEligibility.effective_from}. Saving applies from ${date}.`
          );
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(graphQlUserMessage(cause));
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [client, employeeId, date]);
  const save = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await client.request<{ saveEmployeePayrollEligibility: Setting }>(
        'mutation SaveEmployeePayrollEligibility($employeeId:ID!,$input:JSON!){saveEmployeePayrollEligibility(employeeId:$employeeId,input:$input)}',
        { employeeId, input: setting }
      );
      setSetting(result.saveEmployeePayrollEligibility);
      setNotice('Employee payroll settings saved. Recalculate the draft to apply them.');
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-4 space-y-3">
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
        <EmployeeEligibilityFields
          eligibility={setting.eligibility}
          onChange={(eligibility) => setSetting({ ...setting, eligibility })}
        />
        <Input
          label="Reason for configuration"
          value={setting.reason}
          onChange={(event) => setSetting({ ...setting, reason: event.target.value })}
        />
        <Button disabled={busy || !setting.reason.trim() || loadFailed} onClick={() => void save()}>
          Save employee payroll settings
        </Button>
      </fieldset>
    </div>
  );
};

const EmployeePayrollSettings = ({ client }: { client: GraphQLClient }) => {
  const [employees, setEmployees] = useState<
    { id: string; employeeCode: string; fullName: string }[]
  >([]);
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void client
      .request<{ employees: typeof employees }>(
        'query EligibilityEmployees { employees(limit:500) { id employeeCode fullName } }'
      )
      .then((result) => {
        if (active) setEmployees(result.employees);
      })
      .catch((cause: unknown) => {
        if (active) setError(graphQlUserMessage(cause));
      });
    return () => {
      active = false;
    };
  }, [client]);
  return (
    <Card title="Employee payroll settings">
      <div data-tour-anchor="payroll.employee-settings" className="space-y-3">
        <p>
          Confirm contribution eligibility once, effective from a payroll month. It carries forward
          until changed. Company rules determine contribution amounts; tax settings are managed in
          Employee Tax &amp; History.
        </p>
        {error && <p role="alert">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <label>
            Employee
            <select
              className="ml-2 rounded border p-2"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.employeeCode} — {employee.fullName}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Effective month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>
        {employeeId && month && (
          <EmployeeEligibilityEditor
            key={`${employeeId}:${month}`}
            client={client}
            employeeId={employeeId}
            date={`${month}-01`}
          />
        )}
      </div>
    </Card>
  );
};
export default EmployeePayrollSettings;
