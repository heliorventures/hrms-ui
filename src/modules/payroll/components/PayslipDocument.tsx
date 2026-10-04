import { useCallback } from 'react';

import Button from '../../../components/common/Button';
import type { PayslipPresentation } from '../payslipPresentation';
import type { UnpaidLeaveSnapshot } from '../unpaidLeaveDocuments';
import { downloadPayslipPdf, loadLogoDataUrlForPdf } from '../utils/payslipPdf';

import PayslipSheet from './PayslipSheet';

export type PayslipLine = {
  id: string;
  salaryComponentId: string;
  amount: string;
  componentType?: string | null;
};

export type PayslipDocModel = {
  presentation?: PayslipPresentation | null;
  unpaidLeave?: UnpaidLeaveSnapshot | null;
  id: string;
  grossSalary: string;
  totalDeductions: string;
  netSalary: string;
  status: string;
  generatedAt: string;
  lines: PayslipLine[];
  pfEmployee?: string | null;
  pfEmployer?: string | null;
  esiEmployee?: string | null;
  esiEmployer?: string | null;
  tdsAmount?: string | null;
  professionalTax?: string | null;
  uanNumber?: string | null;
  esicNumber?: string | null;
};

type PayslipDocumentProps = {
  detailsPending?: boolean;
  tenantName: string;
  /** From `payroll_compliance_setting.payslipHeaderTitle` when configured. */
  companyHeaderName?: string | null;
  /** HMAC URL from `payslipLogoSignedReadUrl` when tenant configured a logo. */
  payslipLogoReadUrl?: string | null;
  employeeName: string;
  employeeCode: string;
  periodLabel: string;
  labelForLine: (line: PayslipLine) => string;
  slip: PayslipDocModel;
};

/**
 * Print-friendly salary slip (browser “Print → Save as PDF”).
 */
const PayslipDocument = ({
  detailsPending = false,
  tenantName,
  companyHeaderName,
  payslipLogoReadUrl,
  employeeName,
  employeeCode,
  periodLabel,
  labelForLine,
  slip,
}: PayslipDocumentProps) => {
  const headerTitle = companyHeaderName?.trim() || tenantName;
  const detailsUnavailable = detailsPending || !slip.presentation;

  const onPrint = useCallback(() => {
    if (detailsUnavailable) return;
    document.documentElement.classList.add('print-payslip');
    const cleanup = () => document.documentElement.classList.remove('print-payslip');
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
  }, [detailsUnavailable]);

  const onDownloadPdf = useCallback(async () => {
    if (detailsUnavailable) return;
    let logoForPdf: { dataUrl: string; format: 'PNG' | 'JPEG' } | null = null;
    if (payslipLogoReadUrl) {
      logoForPdf = await loadLogoDataUrlForPdf(payslipLogoReadUrl);
    }
    downloadPayslipPdf(
      {
        companyLine: headerTitle,
        periodLabel,
        employeeName,
        employeeCode,
        logoForPdf,
      },
      slip,
      (line) =>
        labelForLine({
          id: line.id ?? line.salaryComponentId,
          salaryComponentId: line.salaryComponentId,
          amount: line.amount,
          componentType: line.componentType,
        })
    );
  }, [
    detailsUnavailable,
    employeeCode,
    employeeName,
    headerTitle,
    labelForLine,
    payslipLogoReadUrl,
    periodLabel,
    slip,
  ]);

  return (
    <div>
      <div className="no-print mb-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => void onDownloadPdf()}
          disabled={detailsUnavailable}
        >
          Download PDF
        </Button>
        <Button type="button" variant="primary" onClick={onPrint} disabled={detailsUnavailable}>
          Print / Save as PDF
        </Button>
        <p className="text-right text-xs text-slate-500">
          In the print dialog, choose &quot;Save as PDF&quot; to download.
        </p>
      </div>

      {detailsUnavailable ? (
        <p role="status">
          Payslip details are unavailable until display settings and calculation details have
          loaded.
        </p>
      ) : (
        <PayslipSheet
          headerTitle={headerTitle}
          payslipLogoReadUrl={payslipLogoReadUrl}
          employeeName={employeeName}
          employeeCode={employeeCode}
          periodLabel={periodLabel}
          slip={slip}
          labelForLine={labelForLine}
        />
      )}
    </div>
  );
};

export default PayslipDocument;
