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
import {
  millisecondsUntilNextMinute,
  tenantCalendarPeriod,
  type TenantCalendarPeriod,
} from '../../../utils/tenantCalendar';
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
const PAY_PERIOD_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
});

interface OwnerBoundValue<T> {
  ownerKey: string;
  value: T;
}

function useCurrentTenantCalendarPeriod(timezone: string): TenantCalendarPeriod {
  const [period, setPeriod] = useState(() => tenantCalendarPeriod(new Date(), timezone));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refreshPeriod = () => {
      const next = tenantCalendarPeriod(new Date(), timezone);
      setPeriod((current) =>
        current.month === next.month && current.year === next.year ? current : next
      );
    };
    const refreshAtNextMinute = () => {
      const now = new Date();
      timer = setTimeout(() => {
        refreshPeriod();
        refreshAtNextMinute();
      }, millisecondsUntilNextMinute(now));
    };
    refreshPeriod();
    refreshAtNextMinute();
    return () => clearTimeout(timer);
  }, [timezone]);

  return period;
}

interface PayrollPayAuthorization {
  canReadPayroll: boolean;
  canReadTax: boolean;
  canSubmitTax: boolean;
  ownerKey: string;
  tenantTimezone: string;
}

export function usePayrollPayData(
  client: GraphQLClient,
  activeTab: PayrollTabId,
  {
    canReadPayroll,
    canReadTax,
    canSubmitTax,
    ownerKey,
    tenantTimezone,
  }: PayrollPayAuthorization
) {
  const [salaryPreviewState, setSalaryPreviewState] =
    useState<OwnerBoundValue<EmployeeSalaryPreview> | null>(null);
  const [taxConfigurations, setTaxConfigurations] = useState<TaxConfigurationRow[] | null>(null);
  const [taxSlabs, setTaxSlabs] = useState<TaxSlabRow[] | null>(null);
  const [payslipState, setPayslipState] =
    useState<OwnerBoundValue<PayslipRow[] | null> | null>(null);
  const [payslipError, setPayslipError] = useState<string | null>(null);
  const [payslipMigrationRequired, setPayslipMigrationRequired] = useState(false);
  const [loadingPayroll, setLoadingPayroll] = useState(false);
  const [loadingTax, setLoadingTax] = useState(false);
  const [payslipsLoading, setPayslipsLoading] = useState(false);
  const [errorShell, setErrorShell] = useState<string | null>(null);
  const [errorSalary, setErrorSalary] = useState<string | null>(null);
  const [shellMigrationRequired, setShellMigrationRequired] = useState(false);
  const [salaryMigrationRequired, setSalaryMigrationRequired] = useState(false);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string | null>(null);
  const [payslipBranding, setPayslipBranding] = useState<PayrollComplianceSettingRow>(null);
  const [payslipLogoReadUrl, setPayslipLogoReadUrl] = useState<string | null>(null);
  const currentPeriod = useCurrentTenantCalendarPeriod(tenantTimezone);
  const salaryPreview =
    salaryPreviewState?.ownerKey === ownerKey ? salaryPreviewState.value : null;
  const payslips = payslipState?.ownerKey === ownerKey ? payslipState.value : null;

  useEffect(() => {
    if (!canReadPayroll) {
      setSalaryPreviewState(null);
      setLoadingPayroll(false);
      setErrorSalary(null);
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
        setSalaryPreviewState(null);
        setLoadingPayroll(true);
        setErrorSalary(null);
        setSalaryMigrationRequired(false);
        const response = await client.request<EmployeeSalaryBreakupPreviewQuery>(
          EmployeeSalaryBreakupPreviewDocument,
          { asOf: null }
        );
        if (!cancelled) {
          setSalaryPreviewState({
            ownerKey,
            value: response.employeeSalaryBreakupPreview ?? null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setSalaryPreviewState(null);
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
  }, [activeTab, canReadPayroll, client, ownerKey]);

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
      setPayslipState(null);
      setPayslipError(null);
      setPayslipMigrationRequired(false);
      setPayslipsLoading(false);
      setSelectedPeriodKey(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        setPayslipState(null);
        setSelectedPeriodKey(null);
        setPayslipsLoading(true);
        setPayslipError(null);
        setPayslipMigrationRequired(false);
        const response = await client.request<{ payslips: PayslipRow[] }>(
          ClientOpsPayslipsForPayrollHubDocument,
          { limit: PAYSPLIP_LIMIT }
        );
        if (!cancelled) setPayslipState({ ownerKey, value: response.payslips });
      } catch (err) {
        if (!cancelled) {
          setPayslipState(null);
          setSelectedPeriodKey(null);
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
    if (!payslips) return [];
    const currentYear = currentPeriod.year;
    const currentMonth = currentPeriod.month;
    const payslipByPeriod = new Map<string, PayslipRow>();
    for (const payslip of payslips) {
      const periodKey = `${payslip.periodYear}-${String(payslip.periodMonth).padStart(2, '0')}`;
      if (!payslipByPeriod.has(periodKey)) payslipByPeriod.set(periodKey, payslip);
    }
    return Array.from({ length: currentMonth }, (_, index): PayslipPeriodOption => {
      const month = currentMonth - index;
      const periodKey = `${currentYear}-${String(month).padStart(2, '0')}`;
      return {
        periodKey,
        label: PAY_PERIOD_FORMATTER.format(new Date(currentYear, month - 1, 1)),
        month,
        year: currentYear,
        payslip: payslipByPeriod.get(periodKey) ?? null,
      };
    });
  }, [currentPeriod.month, currentPeriod.year, payslips]);

  useEffect(() => {
    if (
      payslipPeriodOptions.length &&
      !payslipPeriodOptions.some((option) => option.periodKey === selectedPeriodKey)
    ) {
      setSelectedPeriodKey(payslipPeriodOptions[0].periodKey);
    }
  }, [payslipPeriodOptions, selectedPeriodKey]);

  const activePayslip = useMemo(() => {
    if (!selectedPeriodKey) return null;
    return (
      payslipPeriodOptions.find((option) => option.periodKey === selectedPeriodKey)?.payslip ?? null
    );
  }, [payslipPeriodOptions, selectedPeriodKey]);

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
    selectedPeriodKey,
    setSelectedPeriodKey,
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
