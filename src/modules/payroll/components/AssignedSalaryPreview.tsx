import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { SalaryBreakupPreviewSection } from '../PayrollCompensationSections';
import type { SalaryBreakupPreview } from '../payrollCompensationTypes';

const SALARY_BREAKUP_PREVIEW = /* GraphQL */ `
  query EmployeeSalaryBreakupPreview($employeeId: ID, $asOf: NaiveDate) {
    employeeSalaryBreakupPreview(employeeId: $employeeId, asOf: $asOf) {
      employeeId
      annualCtc
      financials
      monthlyGross
      monthlyDeductions
      monthlyNetBeforeStatutory
      lines {
        salaryComponentId
        componentName
        componentCode
        componentType
        calculationBasis
        calculationValue
        annualAmount
        monthlyAmount
        isOverride
      }
    }
  }
`;

const today = () => new Date().toISOString().slice(0, 10);
const AssignedSalaryPreview = ({
  client,
  employeeId,
  revision,
}: {
  client: GraphQLClient;
  employeeId: string;
  revision: number;
}) => {
  const [preview, setPreview] = useState<SalaryBreakupPreview | null>(null);
  const [previewDate, setPreviewDate] = useState(today());
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setPreview(null);
    setPreviewError(null);
    setPreviewLoading(false);
    if (!employeeId || !previewDate) return;
    setPreviewLoading(true);
    void client
      .request<{ employeeSalaryBreakupPreview: SalaryBreakupPreview | null }>(
        SALARY_BREAKUP_PREVIEW,
        { employeeId: employeeId, asOf: previewDate }
      )
      .then((result) => {
        if (active) setPreview(result.employeeSalaryBreakupPreview);
      })
      .catch((cause: unknown) => {
        if (active) setPreviewError(graphQlUserMessage(cause));
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });
    return () => {
      active = false;
    };
  }, [client, employeeId, previewDate, revision]);

  return (
    <div>
      {employeeId && (
        <div className="space-y-3" data-tour-anchor="payroll.compensation.existing-assignment">
          <label className="block text-sm">
            View assigned salary as of
            <input
              type="date"
              className="ml-3 rounded border p-2"
              value={previewDate}
              onChange={(event) => setPreviewDate(event.target.value)}
            />
          </label>
          {previewLoading && <p role="status">Loading assigned salary...</p>}
          {previewError && <p role="alert">{previewError}</p>}
          {!previewLoading && !previewError && !preview && (
            <p>No salary assignment is effective on this date.</p>
          )}
          {!previewLoading && preview && <SalaryBreakupPreviewSection preview={preview} />}
        </div>
      )}
    </div>
  );
};
export default AssignedSalaryPreview;
