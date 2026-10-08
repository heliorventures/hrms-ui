import type { usePayrollPayData } from '../hooks/usePayrollPayData';

import PayrollIncomeTaxTab from './PayrollIncomeTaxTab';

const EmployeeTaxFormsPanel = ({
  pay,
  canSubmitTax,
}: {
  pay: ReturnType<typeof usePayrollPayData>;
  canSubmitTax: boolean;
}) => (
  <PayrollIncomeTaxTab
    submissionContext={pay.submissionContext}
    canSubmitTax={canSubmitTax}
    declDed={pay.declDed}
    declFy={pay.declFy}
    declGross={pay.declGross}
    declMsg={pay.declMsg}
    declRegime={pay.declRegime}
    declSubmitting={pay.declSubmitting}
    employeeTaxError={pay.employeeTaxError}
    loadingEmployeeTax={pay.loadingEmployeeTax}
    loadingShell={pay.loadingShell}
    payslipError={pay.payslipError}
    payslipIndiaFyTotals={pay.payslipIndiaFyTotals}
    payslipsLoading={pay.payslipsLoading}
    proofActual={pay.proofActual}
    proofBusy={pay.proofBusy}
    proofDeclared={pay.proofDeclared}
    proofFile={pay.proofFile}
    proofMsg={pay.proofMsg}
    proofSectionCode={pay.proofSectionCode}
    taxComputationsSelf={pay.taxComputationsSelf}
    taxProofLinesSelf={pay.taxProofLinesSelf}
    taxSectionCatalog={pay.taxSectionCatalog}
    onDeclDedChange={pay.setDeclDed}
    onDeclGrossChange={pay.setDeclGross}
    onDeclSubmit={(event) => void pay.handleDeclUpsert(event)}
    onProofActualChange={pay.setProofActual}
    onProofDeclaredChange={pay.setProofDeclared}
    onProofFileChange={pay.setProofFile}
    onProofSectionCodeChange={pay.setProofSectionCode}
    onProofSubmit={(event) => void pay.handleProofSubmit(event)}
  />
);
export default EmployeeTaxFormsPanel;
