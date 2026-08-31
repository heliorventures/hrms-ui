import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';
import {
  ClientOpsPayslipsForPayrollHubDocument,
  ClientOpsPayrollTaxBoardDocument,
  EmployeeSalaryBreakupPreviewDocument,
  PayrollComplianceSettingDocument,
  type EmployeeSalaryBreakupPreviewQuery,
  type PayrollComplianceSettingQuery,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { PayslipLogoSignedReadUrlDocument } from '../documents';
import { isMissingPayrollCoreError } from '../payrollFormatters';
import type {
  EmployeeSalaryPreview,
  PayrollComplianceSettingRow,
  PayrollTabId,
  PayslipPeriodOption,
  PayslipRow,
  TaxConfigurationRow,
  TaxSlabRow,
} from '../payrollTypes';
import { useEmployeeTaxSelfService } from './useEmployeeTaxSelfService';

const PAYSPLIP_LIMIT = 24;

interface PayrollPayAuthorization {
  canReadPayroll: boolean;
  canReadTax: boolean;
  canSubmitTax: boolean;
  employeeId?: string | null;
  ownerKey: string;
}

export function usePayrollPayData(
  client: GraphQLClient,
  activeTab: PayrollTabId,
  { canReadPayroll, canReadTax, canSubmitTax, employeeId, ownerKey }: PayrollPayAuthorization
) {
  const [salaryPreview, setSalaryPreview] = useState<EmployeeSalaryPreview>(null);
  const [taxConfigurations, setTaxConfigurations] = useState<TaxConfigurationRow[] | null>(null);
  const [taxSlabs, setTaxSlabs] = useState<TaxSlabRow[] | null>(null);
  const [payslips, setPayslips] = useState<PayslipRow[] | null>(null);
  const [payslipError, setPayslipError] = useState<string | null>(null);
  const [payslipMigrationRequired, setPayslipMigrationRequired] = useState(false);
  const [loadingPayroll, setLoadingPayroll] = useState(false);
  const [loadingTax, setLoadingTax] = useState(false);
  const [payslipsLoading, setPayslipsLoading] = useState(false);
  const [errorShell, setErrorShell] = useState<string | null>(null);
  const [errorSalary, setErrorSalary] = useState<string | null>(null);
  const [shellMigrationRequired, setShellMigrationRequired] = useState(false);
  const [salaryMigrationRequired, setSalaryMigrationRequired] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [payslipBranding, setPayslipBranding] = useState<PayrollComplianceSettingRow>(null);
  const [payslipLogoReadUrl, setPayslipLogoReadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!canReadPayroll || !employeeId) {
      setSalaryPreview(null);
      setLoadingPayroll(false);
      setErrorSalary(
        canReadPayroll && !employeeId
          ? 'Your account is not linked to an employee record. Contact your HR administrator.'
          : null
      );
      setSalaryMigrationRequired(false);
      return;
    }
    if (activeTab !== 'salary') {
      setLoadingPayroll(false);
      setErrorSalary(null);
      setSalaryMigrationRequired(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        setLoadingPayroll(true);
        setErrorSalary(null);
        setSalaryMigrationRequired(false);
        const response = await client.request<EmployeeSalaryBreakupPreviewQuery>(
          EmployeeSalaryBreakupPreviewDocument,
          { employeeId, asOf: null }
        );
        if (!cancelled) {
          setSalaryPreview(response.employeeSalaryBreakupPreview ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setSalaryPreview(null);
          setSalaryMigrationRequired(isMissingPayrollCoreError(err));
          setErrorSalary(graphQlUserMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingPayroll(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, canReadPayroll, client, employeeId, ownerKey]);

  useEffect(() => {
    if (!canReadTax || activeTab !== 'incometax') {
      setTaxConfigurations(null);
      setTaxSlabs(null);
      setLoadingTax(false);
      setErrorShell(null);
      setShellMigrationRequired(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        setLoadingTax(true);
        setErrorShell(null);
        setShellMigrationRequired(false);
        const response = await client.request<{
          taxConfigurations: TaxConfigurationRow[];
          taxSlabs: TaxSlabRow[];
        }>(ClientOpsPayrollTaxBoardDocument, { limit: 100 });
        if (!cancelled) {
          setTaxConfigurations(response.taxConfigurations);
          setTaxSlabs(response.taxSlabs);
        }
      } catch (err) {
        if (!cancelled) {
          setTaxConfigurations(null);
          setTaxSlabs(null);
          setShellMigrationRequired(isMissingPayrollCoreError(err));
          setErrorShell(graphQlUserMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingTax(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, canReadTax, client, ownerKey]);

  useEffect(() => {
    if (!canReadPayroll || (activeTab !== 'payslip' && activeTab !== 'incometax')) {
      setPayslips(null);
      setPayslipError(null);
      setPayslipMigrationRequired(false);
      setPayslipsLoading(false);
      setSelectedCycleId(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        setPayslipsLoading(true);
        setPayslipError(null);
        setPayslipMigrationRequired(false);
        const response = await client.request<{ payslips: PayslipRow[] }>(
          ClientOpsPayslipsForPayrollHubDocument,
          { limit: PAYSPLIP_LIMIT }
        );
        if (!cancelled) setPayslips(response.payslips);
      } catch (err) {
        if (!cancelled) {
          setPayslipMigrationRequired(isMissingPayrollCoreError(err));
          setPayslipError(graphQlUserMessage(err));
        }
      } finally {
        if (!cancelled) setPayslipsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, canReadPayroll, client, ownerKey]);

  useEffect(() => {
    if (!canReadPayroll || activeTab !== 'payslip') {
      setPayslipBranding(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response =
          await client.request<PayrollComplianceSettingQuery>(PayrollComplianceSettingDocument);
        if (!cancelled) setPayslipBranding(response.payrollComplianceSetting ?? null);
      } catch {
        if (!cancelled) setPayslipBranding(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, canReadPayroll, client, ownerKey]);

  useEffect(() => {
    const id = payslipBranding?.payslipLogoFileStorageId?.trim();
    if (!canReadPayroll || !id || activeTab !== 'payslip') {
      setPayslipLogoReadUrl(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await client.request<{ payslipLogoSignedReadUrl: string }>(
          PayslipLogoSignedReadUrlDocument,
          { fileStorageId: id }
        );
        if (!cancelled) setPayslipLogoReadUrl(response.payslipLogoSignedReadUrl);
      } catch {
        if (!cancelled) setPayslipLogoReadUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, canReadPayroll, client, ownerKey, payslipBranding?.payslipLogoFileStorageId]);

  const payslipPeriodOptions = useMemo(() => {
    if (!payslips?.length) return [];
    const seen = new Set<string>();
    const options: PayslipPeriodOption[] = [];
    for (const payslip of payslips) {
      if (seen.has(payslip.payrollCycleId)) continue;
      seen.add(payslip.payrollCycleId);
      const generatedAt = new Date(payslip.generatedAt);
      const validGeneratedAt = Number.isFinite(generatedAt.getTime());
      options.push({
        cycleId: payslip.payrollCycleId,
        label: validGeneratedAt
          ? `Generated ${generatedAt.toLocaleDateString('en-IN')}`
          : `Payslip ${payslip.payrollCycleId.slice(0, 8)}`,
        payslip,
        sort: validGeneratedAt ? generatedAt.getTime() : 0,
      });
    }
    return options.sort((a, b) => b.sort - a.sort);
  }, [payslips]);

  useEffect(() => {
    if (payslipPeriodOptions.length && !selectedCycleId) {
      setSelectedCycleId(payslipPeriodOptions[0].cycleId);
    }
  }, [payslipPeriodOptions, selectedCycleId]);

  const activePayslip = useMemo(() => {
    if (!selectedCycleId) return null;
    return payslipPeriodOptions.find((option) => option.cycleId === selectedCycleId)?.payslip ?? null;
  }, [payslipPeriodOptions, selectedCycleId]);

  const labelForLine = useCallback(
    (line: { salaryComponentId: string; componentType?: string | null }) => {
      const component = salaryPreview?.lines.find(
        (item) => item.salaryComponentId === line.salaryComponentId
      );
      return (
        component?.componentName ??
        line.componentType ??
        `Component ${line.salaryComponentId.slice(0, 8)}…`
      );
    },
    [salaryPreview]
  );

  const activeTaxConfig = useMemo(
    () => taxConfigurations?.find((config) => config.isActive) ?? null,
    [taxConfigurations]
  );

  const activeTaxSlabs = useMemo(
    () =>
      activeTaxConfig
        ? (taxSlabs ?? []).filter((slab) => slab.taxConfigVersionId === activeTaxConfig.id)
        : [],
    [activeTaxConfig, taxSlabs]
  );

  const employeeTax = useEmployeeTaxSelfService(
    client,
    activeTaxConfig,
    {
      enabled: canReadTax && activeTab === 'incometax',
      canSubmit: canSubmitTax,
      ownerKey,
    }
  );

  return {
    salaryPreview,
    taxConfigurations,
    payslips,
    payslipError,
    payslipMigrationRequired,
    loadingShell: loadingTax,
    loadingSalary: loadingPayroll,
    payslipsLoading,
    errorShell,
    errorSalary,
    showMigrationHint: shellMigrationRequired || salaryMigrationRequired,
    selectedCycleId,
    setSelectedCycleId,
    payslipBranding,
    payslipLogoReadUrl,
    payslipPeriodOptions,
    activePayslip,
    labelForLine,
    activeTaxConfig,
    activeTaxSlabs,
    payslipIndiaFyTotals: null,
    ...employeeTax,
  };
}
