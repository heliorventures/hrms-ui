import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { useTenant } from '../../../contexts/TenantContext';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { usePayslipPresentation } from '../hooks/usePayslipPresentation';
import { usePayslipUnpaidLeave } from '../hooks/usePayslipUnpaidLeave';
import type { PayrollComplianceSettingRow, PayslipRow } from '../payrollTypes';

import PayslipDocument from './PayslipDocument';

interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
}
interface Result {
  payslips: PayslipRow[];
  payrollComplianceSetting: PayrollComplianceSettingRow;
  salaryComponents: { id: string; name: string }[];
}
const query = `query ManagedEmployeePayslips($employeeId: ID!) {
  payslips(employeeId:$employeeId,limit:120) {
    id payrollCycleId periodMonth periodYear grossSalary totalDeductions netSalary
    pfEmployee pfEmployer esiEmployee esiEmployer tdsAmount professionalTax uanNumber esicNumber status generatedAt
    lines { id salaryComponentId amount componentType }
  }
  payrollComplianceSetting { payslipHeaderTitle payslipLogoFileStorageId }
  salaryComponents(limit:500) { id name }
}`;

const ManagedPayslipDocument = ({
  client,
  ownerKey,
  employee,
  data,
  slip,
}: {
  client: GraphQLClient;
  ownerKey: string;
  employee: Employee;
  data: Result;
  slip: PayslipRow;
}) => {
  const { currentTenant } = useTenant();
  const presentation = usePayslipPresentation(client, ownerKey, slip.id);
  const unpaid = usePayslipUnpaidLeave(client, ownerKey, slip.id);
  const [logo, setLogo] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const id = data.payrollComplianceSetting?.payslipLogoFileStorageId;
    if (id)
      void client
        .request<{ payslipLogoSignedReadUrl: string }>(
          'query ManagedPayslipLogo($fileStorageId:ID!){payslipLogoSignedReadUrl(fileStorageId:$fileStorageId)}',
          { fileStorageId: id }
        )
        .then((value) => {
          if (active) setLogo(value.payslipLogoSignedReadUrl);
        })
        .catch(() => {
          if (active) setLogo(null);
        });
    return () => {
      active = false;
    };
  }, [client, data.payrollComplianceSetting?.payslipLogoFileStorageId]);
  return (
    <>
      {(presentation.error || unpaid.error) && (
        <p role="alert">
          Payslip details could not be loaded. {presentation.error ?? unpaid.error}
          <Button
            variant="outline"
            onClick={() => {
              presentation.retry();
              unpaid.retry();
            }}
          >
            Retry payslip details
          </Button>
        </p>
      )}
      <PayslipDocument
        tenantName={currentTenant.name}
        companyHeaderName={data.payrollComplianceSetting?.payslipHeaderTitle}
        payslipLogoReadUrl={logo}
        employeeCode={employee.employeeCode}
        employeeName={employee.fullName}
        periodLabel={`${slip.periodYear}-${String(slip.periodMonth).padStart(2, '0')}`}
        labelForLine={(line) =>
          data.salaryComponents.find((item) => item.id === line.salaryComponentId)?.name ??
          'Salary component'
        }
        slip={{ ...slip, presentation: presentation.data, unpaidLeave: unpaid.data }}
        detailsPending={
          presentation.loading || unpaid.loading || !!presentation.error || !!unpaid.error
        }
      />
    </>
  );
};

const ManagedPayslips = ({ client, ownerKey }: { client: GraphQLClient; ownerKey: string }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [data, setData] = useState<{ employeeId: string; result: Result } | null>(null);
  const [slipId, setSlipId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void client
      .request<{ employees: Employee[] }>(
        'query ManagedPayslipEmployees { employees(limit:500) { id employeeCode fullName } }'
      )
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
  useEffect(() => {
    let active = true;
    setData(null);
    setSlipId('');
    setError('');
    setBusy(false);
    if (!employeeId) return;
    setBusy(true);
    void client
      .request<Result>(query, { employeeId })
      .then((result) => {
        if (active) {
          setData({ employeeId, result });
          setSlipId(result.payslips[0]?.id ?? '');
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(graphQlUserMessage(cause));
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [client, employeeId]);
  const selected = employees.find((employee) => employee.id === employeeId);
  const result = data?.employeeId === employeeId ? data.result : null;
  const slip = result?.payslips.find((item) => item.id === slipId);
  return (
    <Card title="Employee payslips">
      <div className="space-y-4" data-tour-anchor="payroll.employee-payslips">
        <div className="grid items-end gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Employee payslips
            <select
              className="h-11 w-full rounded-lg border border-line bg-surface px-3"
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
          {result && result.payslips.length > 0 && (
            <label className="flex flex-col gap-1 text-sm">
              Payslip period
              <select
                className="h-11 w-full rounded-lg border border-line bg-surface px-3"
                value={slipId}
                onChange={(event) => setSlipId(event.target.value)}
              >
                {result.payslips.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.periodYear}-{String(item.periodMonth).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {error && <p role="alert">{error}</p>}
        {busy && <p role="status">Loading employee payslips...</p>}
        {result && result.payslips.length === 0 && (
          <p>
            No finalized payslips for this employee. Draft calculations are available in Payroll
            Runs.
          </p>
        )}
        <SelectedPayslip
          key={`${ownerKey}:${employeeId}:${slipId}`}
          client={client}
          ownerKey={ownerKey}
          employee={selected}
          data={result}
          slip={slip}
        />
      </div>
    </Card>
  );
};
const SelectedPayslip = ({
  client,
  ownerKey,
  employee,
  data,
  slip,
}: {
  client: GraphQLClient;
  ownerKey: string;
  employee: Employee | undefined;
  data: Result | null;
  slip: PayslipRow | undefined;
}) => {
  if (!employee || !data || !slip) return null;
  return (
    <ManagedPayslipDocument
      client={client}
      ownerKey={ownerKey}
      employee={employee}
      data={data}
      slip={slip}
    />
  );
};
export default ManagedPayslips;
