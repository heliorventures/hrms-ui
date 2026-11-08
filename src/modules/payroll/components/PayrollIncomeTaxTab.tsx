import type { FormEvent } from 'react';

import FeedbackToast from '../../../components/common/FeedbackToast';
import type {
  PayslipIndiaFyTotals,
  TaxComputationSelfRow,
  TaxProofLineSelfRow,
  TaxSectionCatalogRow,
} from '../payrollTypes';
import type { TaxSubmissionContext } from '../taxSubmissionContext';

import { EmployeeTaxTables, PayslipFySummaryCard } from './EmployeeTaxCards';
import { EmployeeTaxDeclarationFormCard, EmployeeTaxProofFormCard } from './EmployeeTaxForms';

interface PayrollIncomeTaxTabProps {
  submissionContext: TaxSubmissionContext | null;
  canSubmitTax: boolean;
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
  proofFile: File | null;
  proofMsg: string | null;
  proofSectionCode: string;
  taxComputationsSelf: TaxComputationSelfRow[] | null;
  taxProofLinesSelf: TaxProofLineSelfRow[] | null;
  taxSectionCatalog: TaxSectionCatalogRow[] | null;
  onDeclDedChange: (value: string) => void;
  onDeclGrossChange: (value: string) => void;
  onDeclSubmit: (event: FormEvent) => void;
  onProofActualChange: (value: string) => void;
  onProofDeclaredChange: (value: string) => void;
  onProofFileChange: (file: File | null) => void;
  onProofSectionCodeChange: (value: string) => void;
  onProofSubmit: (event: FormEvent) => void;
}

const PayrollIncomeTaxTab = ({
  submissionContext,
  canSubmitTax,
  declDed,
  declFy,
  declGross,
  declMsg,
  declRegime,
  declSubmitting,
  employeeTaxError,
  loadingEmployeeTax,
  payslipError,
  payslipIndiaFyTotals,
  payslipsLoading,
  proofActual,
  proofBusy,
  proofDeclared,
  proofFile,
  proofMsg,
  proofSectionCode,
  taxComputationsSelf,
  taxProofLinesSelf,
  taxSectionCatalog,
  onDeclDedChange,
  onDeclGrossChange,
  onDeclSubmit,
  onProofActualChange,
  onProofDeclaredChange,
  onProofFileChange,
  onProofSectionCodeChange,
  onProofSubmit,
}: PayrollIncomeTaxTabProps) => (
  <div className="space-y-6">
    {payslipIndiaFyTotals && (
      <PayslipFySummaryCard
        totals={payslipIndiaFyTotals}
        payslipError={payslipError}
        payslipsLoading={payslipsLoading}
      />
    )}
    {employeeTaxError && (
      <>
        <FeedbackToast variant={'error'} messageKey={employeeTaxError}>
          {employeeTaxError}
        </FeedbackToast>
      </>
    )}
    <EmployeeTaxTables
      submissionContext={submissionContext}
      computations={taxComputationsSelf}
      proofs={taxProofLinesSelf}
      loading={loadingEmployeeTax}
      hasError={Boolean(employeeTaxError)}
    />
    {canSubmitTax ? (
      <EmployeeTaxProofFormCard
        submissionContext={submissionContext}
        loading={loadingEmployeeTax}
        catalog={taxSectionCatalog}
        sectionCode={proofSectionCode}
        declared={proofDeclared}
        actual={proofActual}
        proofFile={proofFile}
        busy={proofBusy}
        message={proofMsg}
        onSectionCodeChange={onProofSectionCodeChange}
        onDeclaredChange={onProofDeclaredChange}
        onActualChange={onProofActualChange}
        onProofFileChange={onProofFileChange}
        onSubmit={onProofSubmit}
      />
    ) : null}
    {canSubmitTax ? (
      <EmployeeTaxDeclarationFormCard
        submissionContext={submissionContext}
        fiscalYear={declFy}
        regime={declRegime}
        gross={declGross}
        deductions={declDed}
        submitting={declSubmitting}
        loading={loadingEmployeeTax}
        message={declMsg}
        onGrossChange={onDeclGrossChange}
        onDeductionsChange={onDeclDedChange}
        onSubmit={onDeclSubmit}
      />
    ) : null}
  </div>
);

export default PayrollIncomeTaxTab;
