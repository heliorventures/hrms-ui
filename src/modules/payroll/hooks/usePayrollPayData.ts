import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';
import {
  ClientOpsPayslipsForPayrollHubDocument,
  PayrollComplianceSettingDocument,
  PayrollSalaryComponentsDocument,
  PayrollShellDocument,
  type PayrollComplianceSettingQuery,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { PayslipLogoSignedReadUrlDocument } from '../documents';
import {
  buildPayslipIndiaFyTotals,
  formatPayrollPeriod,
  isMissingPayrollCoreError,
} from '../payrollFormatters';
import type {
  PayrollComplianceSettingRow,
  PayrollCycleRow,
  PayrollTabId,
  PayslipPeriodOption,
  PayslipRow,
  SalaryComponentRow,
  TaxConfigurationRow,
  TaxSlabRow,
} from '../payrollTypes';
import { useEmployeeTaxSelfService } from './useEmployeeTaxSelfService';

const PAYSPLIP_LIMIT = 24;

export function usePayrollPayData(client: GraphQLClient, activeTab: PayrollTabId) {
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycleRow[] | null>(null);
  const [taxConfigurations, setTaxConfigurations] = useState<TaxConfigurationRow[] | null>(null);
  const [taxSlabs, setTaxSlabs] = useState<TaxSlabRow[] | null>(null);
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponentRow[] | null>(null);
  const [payslips, setPayslips] = useState<PayslipRow[] | null>(null);
  const [payslipError, setPayslipError] = useState<string | null>(null);
  const [payslipMigrationRequired, setPayslipMigrationRequired] = useState(false);
  const [loadingShell, setLoadingShell] = useState(true);
  const [loadingSalary, setLoadingSalary] = useState(true);
  const [payslipsLoading, setPayslipsLoading] = useState(false);
  const [errorShell, setErrorShell] = useState<string | null>(null);
  const [errorSalary, setErrorSalary] = useState<string | null>(null);
  const [shellMigrationRequired, setShellMigrationRequired] = useState(false);
  const [salaryMigrationRequired, setSalaryMigrationRequired] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [payslipBranding, setPayslipBranding] = useState<PayrollComplianceSettingRow>(null);
  const [payslipLogoReadUrl, setPayslipLogoReadUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoadingShell(true);
        setErrorShell(null);
        setShellMigrationRequired(false);
        const response = await client.request<{
          payrollCycles: PayrollCycleRow[];
          taxConfigurations: TaxConfigurationRow[];
          taxSlabs: TaxSlabRow[];
        }>(PayrollShellDocument);
        if (!cancelled) {
          setPayrollCycles(response.payrollCycles);
          setTaxConfigurations(response.taxConfigurations);
          setTaxSlabs(response.taxSlabs);
        }
      } catch (err) {
        if (!cancelled) {
          setShellMigrationRequired(isMissingPayrollCoreError(err));
          setErrorShell(graphQlUserMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingShell(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoadingSalary(true);
        setErrorSalary(null);
        setSalaryMigrationRequired(false);
        const response = await client.request<{ salaryComponents: SalaryComponentRow[] }>(
          PayrollSalaryComponentsDocument
        );
        if (!cancelled) setSalaryComponents(response.salaryComponents);
      } catch (err) {
        if (!cancelled) {
          setSalaryMigrationRequired(isMissingPayrollCoreError(err));
          setErrorSalary(graphQlUserMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingSalary(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    if (activeTab !== 'payslip' && activeTab !== 'incometax') return;
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
  }, [client, activeTab]);

  useEffect(() => {
    if (activeTab !== 'payslip') return;
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
  }, [client, activeTab]);

  useEffect(() => {
    const id = payslipBranding?.payslipLogoFileStorageId?.trim();
    if (!id || activeTab !== 'payslip') {
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
  }, [client, activeTab, payslipBranding?.payslipLogoFileStorageId]);

  const cycleById = useMemo(() => {
    const map = new Map<string, PayrollCycleRow>();
    (payrollCycles ?? []).forEach((cycle) => map.set(cycle.id, cycle));
    return map;
  }, [payrollCycles]);

  const payslipPeriodOptions = useMemo(() => {
    if (!payslips?.length) return [];
    const seen = new Set<string>();
    const options: PayslipPeriodOption[] = [];
    for (const payslip of payslips) {
      if (seen.has(payslip.payrollCycleId)) continue;
      const cycle = cycleById.get(payslip.payrollCycleId);
      seen.add(payslip.payrollCycleId);
      options.push({
        cycleId: payslip.payrollCycleId,
        label: cycle ? formatPayrollPeriod(cycle) : payslip.payrollCycleId.slice(0, 8),
        payslip,
        sort: cycle ? cycle.year * 100 + cycle.month : 0,
      });
    }
    return options.sort((a, b) => b.sort - a.sort);
  }, [cycleById, payslips]);

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
      const component = salaryComponents?.find((item) => item.id === line.salaryComponentId);
      return component?.name ?? line.componentType ?? `Component ${line.salaryComponentId.slice(0, 8)}…`;
    },
    [salaryComponents]
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

  const payslipIndiaFyTotals = useMemo(
    () => buildPayslipIndiaFyTotals(payslips, cycleById, activeTaxConfig?.fiscalYear),
    [activeTaxConfig?.fiscalYear, cycleById, payslips]
  );

  const employeeTax = useEmployeeTaxSelfService(
    client,
    activeTab === 'incometax',
    activeTaxConfig
  );

  return {
    payrollCycles,
    taxConfigurations,
    salaryComponents,
    payslips,
    payslipError,
    payslipMigrationRequired,
    loadingShell,
    loadingSalary,
    payslipsLoading,
    errorShell,
    errorSalary,
    showMigrationHint: shellMigrationRequired || salaryMigrationRequired,
    selectedCycleId,
    setSelectedCycleId,
    payslipBranding,
    payslipLogoReadUrl,
    cycleById,
    payslipPeriodOptions,
    activePayslip,
    labelForLine,
    activeTaxConfig,
    activeTaxSlabs,
    payslipIndiaFyTotals,
    ...employeeTax,
  };
}
