import type { FormEvent } from 'react';
import Card from '../../../components/common/Card';
import {
  ActiveTaxConfigurationCard,
  EmployeeTaxTables,
  PayslipFySummaryCard,
  TaxSlabsCard,
} from './EmployeeTaxCards';
import { EmployeeTaxDeclarationFormCard, EmployeeTaxProofFormCard } from './EmployeeTaxForms';
import type {
  PayslipIndiaFyTotals,
  TaxComputationSelfRow,
  TaxConfigurationRow,
  TaxProofLineSelfRow,
  TaxSectionCatalogRow,
  TaxSlabRow,
} from '../payrollTypes';

interface PayrollIncomeTaxTabProps {
  activeTaxConfig: TaxConfigurationRow | null;
  activeTaxSlabs: TaxSlabRow[];
  declDed: string;
  declFy: string;
  declGross: string;
  declMsg: string | null;
  declRegime: string;
  declSubmitting: boolean;
  employeeTaxError: string | null;
  loadingEmployeeTax: boolean;
  loadingShell: boolean;
  payslipError: string | null;
  payslipIndiaFyTotals: PayslipIndiaFyTotals | null;
  payslipsLoading: boolean;
  proofActual: string;
  proofBusy: boolean;
  proofDeclared: string;
  proofMsg: string | null;
  proofSectionCode: string;
  taxComputationsSelf: TaxComputationSelfRow[] | null;
  taxProofLinesSelf: TaxProofLineSelfRow[] | null;
  taxSectionCatalog: TaxSectionCatalogRow[] | null;
  onDeclDedChange: (value: string) => void;
  onDeclFyChange: (value: string) => void;
  onDeclGrossChange: (value: string) => void;
  onDeclRegimeChange: (value: string) => void;
  onDeclSubmit: (event: FormEvent) => void;
  onProofActualChange: (value: string) => void;
  onProofDeclaredChange: (value: string) => void;
  onProofSectionCodeChange: (value: string) => void;
  onProofSubmit: (event: FormEvent) => void;
}

const PayrollIncomeTaxTab = ({
  activeTaxConfig,
  activeTaxSlabs,
  declDed,
  declFy,
  declGross,
  declMsg,
  declRegime,
  declSubmitting,
  employeeTaxError,
  loadingEmployeeTax,
  loadingShell,
  payslipError,
  payslipIndiaFyTotals,
  payslipsLoading,
  proofActual,
  proofBusy,
  proofDeclared,
  proofMsg,
  proofSectionCode,
  taxComputationsSelf,
  taxProofLinesSelf,
  taxSectionCatalog,
  onDeclDedChange,
  onDeclFyChange,
  onDeclGrossChange,
  onDeclRegimeChange,
  onDeclSubmit,
  onProofActualChange,
  onProofDeclaredChange,
  onProofSectionCodeChange,
  onProofSubmit,
}: PayrollIncomeTaxTabProps) => (
  <div className="space-y-6">
    <ActiveTaxConfigurationCard activeTaxConfig={activeTaxConfig} loadingShell={loadingShell} />
    <TaxSlabsCard activeTaxSlabs={activeTaxSlabs} loadingShell={loadingShell} />
    {payslipIndiaFyTotals && (
      <PayslipFySummaryCard
        totals={payslipIndiaFyTotals}
        payslipError={payslipError}
        payslipsLoading={payslipsLoading}
      />
    )}
    {employeeTaxError && (
      <Card>
        <p className="text-sm text-red-600 dark:text-red-400">{employeeTaxError}</p>
      </Card>
    )}
    <EmployeeTaxTables
      computations={taxComputationsSelf}
      proofs={taxProofLinesSelf}
      loading={loadingEmployeeTax}
      hasError={Boolean(employeeTaxError)}
    />
    <EmployeeTaxProofFormCard
      activeTaxConfig={activeTaxConfig}
      loading={loadingEmployeeTax}
      catalog={taxSectionCatalog}
      sectionCode={proofSectionCode}
      declared={proofDeclared}
      actual={proofActual}
      busy={proofBusy}
      message={proofMsg}
      onSectionCodeChange={onProofSectionCodeChange}
      onDeclaredChange={onProofDeclaredChange}
      onActualChange={onProofActualChange}
      onSubmit={onProofSubmit}
    />
    <EmployeeTaxDeclarationFormCard
      activeTaxConfig={activeTaxConfig}
      fiscalYear={declFy}
      regime={declRegime}
      gross={declGross}
      deductions={declDed}
      submitting={declSubmitting}
      loading={loadingEmployeeTax}
      message={declMsg}
      onFiscalYearChange={onDeclFyChange}
      onRegimeChange={onDeclRegimeChange}
      onGrossChange={onDeclGrossChange}
      onDeductionsChange={onDeclDedChange}
      onSubmit={onDeclSubmit}
    />
  </div>
);

export default PayrollIncomeTaxTab;
