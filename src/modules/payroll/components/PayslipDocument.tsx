import { useCallback } from 'react';

import Button from '../../../components/common/Button';
import FeedbackToast from '../../../components/common/FeedbackToast';
import type { PayslipPresentation } from '../payslipPresentation';
import { PAYSLIP_TEMPLATES, resolvePayslipTemplate } from '../payslipTemplates';
import type { UnpaidLeaveSnapshot } from '../unpaidLeaveDocuments';
import { downloadPayslipPdf, loadLogoDataUrlForPdf } from '../utils/payslipPdf';

import PayrollHelp from './PayrollHelp';
import { PAYSLIP_SHEETS } from './payslipSheetRegistry';

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
  companyAddress?: string | null;
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
  companyAddress,
  payslipLogoReadUrl,
  employeeName,
  employeeCode,
  periodLabel,
  labelForLine,
  slip,
}: PayslipDocumentProps) => {
  const headerTitle = companyHeaderName?.trim() || tenantName;
  const template = slip.presentation?.template;
  const invalidTemplate =
    template !== undefined && !PAYSLIP_TEMPLATES.some((item) => item.id === template);
  const detailsUnavailable = detailsPending || !slip.presentation || invalidTemplate;
  const Sheet = PAYSLIP_SHEETS[resolvePayslipTemplate(invalidTemplate ? null : template)];

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
        companyAddress,
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
    companyAddress,
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
      <div className="no-print mb-3 flex flex-wrap items-center justify-end gap-2">
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
        <PayrollHelp label="About payslip downloads">
          Download PDF directly, or select Save as PDF in the print dialog. Downloads are available
          after payslip display and calculation details load.
        </PayrollHelp>
      </div>

      {invalidTemplate && (
        <FeedbackToast variant={'error'}>
          The company payslip template is unsupported. Contact your payroll administrator.
        </FeedbackToast>
      )}
      {detailsUnavailable ? (
        <p role="status">
          Payslip details are unavailable until display settings and calculation details have
          loaded.
        </p>
      ) : (
        <Sheet
          headerTitle={headerTitle}
          companyAddress={companyAddress}
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
