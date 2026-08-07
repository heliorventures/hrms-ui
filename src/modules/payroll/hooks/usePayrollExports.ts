import { useCallback, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';
import {
  IndiaEpfMonthlyEcrPrepStubCsvDocument,
  IndiaForm16PartBFyPrepStubCsvDocument,
  IndiaForm24qSalaryPaymentMonthlyStubCsvDocument,
  IndiaFyPayrollEmployeeTotalsCsvDocument,
  IndiaFyQuarterPayrollEmployeeTotalsCsvDocument,
  IndiaPfEsiMonthlySummaryCsvDocument,
  IndiaTdsMonthlySummaryCsvDocument,
  PayrollBankTransferCsvDocument,
  PayrollIndiaBulkNeftCreditCsvDocument,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { indiaFyStartYearFromDate } from '../utils/indiaFy';
import { downloadCsv, monthToken } from '../payrollCsvDownload';

export type MonthlyPayrollExportKey = 'tds' | 'pfEsi' | 'form24q' | 'epfEcr' | 'bank' | 'neft';
export type FyPayrollExportKey = 'fyTotals' | 'fyQuarterTotals' | 'form16';

type ExportStatus = Record<string, { exporting: boolean; error: string | null }>;

const DEFAULT_MONTHLY_STATUS: ExportStatus = {
  tds: { exporting: false, error: null },
  pfEsi: { exporting: false, error: null },
  form24q: { exporting: false, error: null },
  epfEcr: { exporting: false, error: null },
  bank: { exporting: false, error: null },
  neft: { exporting: false, error: null },
};

const DEFAULT_FY_STATUS: ExportStatus = {
  fyTotals: { exporting: false, error: null },
  fyQuarterTotals: { exporting: false, error: null },
  form16: { exporting: false, error: null },
};

export function usePayrollExports(client: GraphQLClient) {
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [fyStartYear, setFyStartYear] = useState(() => indiaFyStartYearFromDate());
  const [fyQuarter, setFyQuarter] = useState(1);
  const [monthlyStatus, setMonthlyStatus] = useState<ExportStatus>(DEFAULT_MONTHLY_STATUS);
  const [fyStatus, setFyStatus] = useState<ExportStatus>(DEFAULT_FY_STATUS);

  const setLatestCyclePeriod = useCallback((cycle?: { month: number; year: number } | null) => {
    if (!cycle) return;
    setMonth(cycle.month);
    setYear(cycle.year);
  }, []);

  const updateMonthlyStatus = useCallback(
    (key: MonthlyPayrollExportKey, exporting: boolean, error: string | null) => {
      setMonthlyStatus((current) => ({ ...current, [key]: { exporting, error } }));
    },
    []
  );

  const updateFyStatus = useCallback(
    (key: FyPayrollExportKey, exporting: boolean, error: string | null) => {
      setFyStatus((current) => ({ ...current, [key]: { exporting, error } }));
    },
    []
  );

  const downloadMonthly = useCallback(
    async (key: MonthlyPayrollExportKey) => {
      updateMonthlyStatus(key, true, null);
      try {
        const token = monthToken(month);
        if (key === 'tds') {
          const res = await client.request<{ indiaTdsMonthlySummaryCsv: string }>(
            IndiaTdsMonthlySummaryCsvDocument,
            { month, year }
          );
          downloadCsv(`india-tds-summary-${year}-${token}.csv`, res.indiaTdsMonthlySummaryCsv);
        } else if (key === 'pfEsi') {
          const res = await client.request<{ indiaPfEsiMonthlySummaryCsv: string }>(
            IndiaPfEsiMonthlySummaryCsvDocument,
            { month, year }
          );
          downloadCsv(`india-pf-esi-summary-${year}-${token}.csv`, res.indiaPfEsiMonthlySummaryCsv);
        } else if (key === 'form24q') {
          const res = await client.request<{
            indiaForm24qSalaryPaymentMonthlyStubCsv: string;
          }>(IndiaForm24qSalaryPaymentMonthlyStubCsvDocument, { month, year });
          downloadCsv(
            `india-form24q-salary-month-stub-${year}-${token}.csv`,
            res.indiaForm24qSalaryPaymentMonthlyStubCsv
          );
        } else if (key === 'epfEcr') {
          const res = await client.request<{ indiaEpfMonthlyEcrPrepStubCsv: string }>(
            IndiaEpfMonthlyEcrPrepStubCsvDocument,
            { month, year }
          );
          downloadCsv(
            `india-epf-ecr-prep-stub-${year}-${token}.csv`,
            res.indiaEpfMonthlyEcrPrepStubCsv
          );
        } else if (key === 'bank') {
          const res = await client.request<{ payrollBankTransferCsv: string }>(
            PayrollBankTransferCsvDocument,
            { month, year }
          );
          downloadCsv(`payroll-bank-transfer-${year}-${token}.csv`, res.payrollBankTransferCsv);
        } else {
          const res = await client.request<{ payrollIndiaBulkNeftCreditCsv: string }>(
            PayrollIndiaBulkNeftCreditCsvDocument,
            { month, year }
          );
          downloadCsv(
            `payroll-india-bulk-neft-credit-${year}-${token}.csv`,
            res.payrollIndiaBulkNeftCreditCsv
          );
        }
        updateMonthlyStatus(key, false, null);
      } catch (err) {
        updateMonthlyStatus(key, false, graphQlUserMessage(err));
      }
    },
    [client, month, updateMonthlyStatus, year]
  );

  const downloadFy = useCallback(
    async (key: FyPayrollExportKey) => {
      updateFyStatus(key, true, null);
      try {
        if (key === 'fyTotals') {
          const res = await client.request<{ indiaFyPayrollEmployeeTotalsCsv: string }>(
            IndiaFyPayrollEmployeeTotalsCsvDocument,
            { fyStartYear }
          );
          downloadCsv(
            `india-fy-employee-payroll-totals-FY${fyStartYear}-${fyStartYear + 1}.csv`,
            res.indiaFyPayrollEmployeeTotalsCsv
          );
        } else if (key === 'fyQuarterTotals') {
          const res = await client.request<{ indiaFyQuarterPayrollEmployeeTotalsCsv: string }>(
            IndiaFyQuarterPayrollEmployeeTotalsCsvDocument,
            { fyStartYear, quarter: fyQuarter }
          );
          downloadCsv(
            `india-fy${fyStartYear}-Q${fyQuarter}-employee-payroll-totals.csv`,
            res.indiaFyQuarterPayrollEmployeeTotalsCsv
          );
        } else {
          const res = await client.request<{ indiaForm16PartBFyPrepStubCsv: string }>(
            IndiaForm16PartBFyPrepStubCsvDocument,
            { fyStartYear }
          );
          downloadCsv(
            `india-form16-partb-fy-prep-stub-FY${fyStartYear}-${fyStartYear + 1}.csv`,
            res.indiaForm16PartBFyPrepStubCsv
          );
        }
        updateFyStatus(key, false, null);
      } catch (err) {
        updateFyStatus(key, false, graphQlUserMessage(err));
      }
    },
    [client, fyQuarter, fyStartYear, updateFyStatus]
  );

  return {
    month,
    setMonth,
    year,
    setYear,
    fyStartYear,
    setFyStartYear,
    fyQuarter,
    setFyQuarter,
    setLatestCyclePeriod,
    monthlyStatus,
    fyStatus,
    downloadMonthly,
    downloadFy,
  };
}
