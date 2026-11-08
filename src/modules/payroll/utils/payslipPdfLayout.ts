import { jsPDF } from 'jspdf';

import { payslipCompanyAddressText } from '../payslipCompanyAddress';
import { payslipDetailValue } from '../payslipDetailValue';
import { payslipLoanText } from '../payslipLoans';
import { resolvePayslipTemplate } from '../payslipTemplates';

import type { PdfPayslipLine, PdfPayslipPayload, PayslipPdfBranding } from './payslipPdf';
import { createTablePayslipPdf } from './payslipTablePdf';

const money = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
};
class PdfWriter {
  readonly doc = new jsPDF({ unit: 'pt', format: 'a4' });
  y = 48;
  text(value: string, bold = false) {
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    this.doc.setFontSize(10);
    const rows = this.doc.splitTextToSize(
      value,
      this.doc.internal.pageSize.getWidth() - 96
    ) as string[];
    for (const row of rows) {
      if (this.y + 14 > this.doc.internal.pageSize.getHeight() - 48) {
        this.doc.addPage();
        this.y = 48;
      }
      this.doc.text(row, 48, this.y);
      this.y += 14;
    }
  }
  space() {
    this.y += 14;
  }
}
const header = (writer: PdfWriter, branding: PayslipPdfBranding, slip: PdfPayslipPayload) => {
  const logo = branding.logoForPdf;
  if (logo) {
    try {
      writer.doc.addImage(logo.dataUrl, logo.format, 48, writer.y, 44, 40);
      writer.y += 48;
    } catch {
      /* A failed logo must not prevent exporting salary information. */
    }
  }
  writer.text(branding.companyLine, true);
  const address = payslipCompanyAddressText(branding.companyAddress);
  if (address) writer.text(address);
  writer.text(`Payslip - ${branding.periodLabel}`);
  writer.space();
  for (const detail of slip.presentation?.employeeDetails ?? [])
    writer.text(`${detail.label}: ${payslipDetailValue(detail)}`);
  writer.space();
};
const legacyLeave = (writer: PdfWriter, slip: PdfPayslipPayload) => {
  const leave = slip.unpaidLeave;
  if (!leave) return;
  writer.text(
    `Unpaid leave: ${leave.unpaidDays} days. ${leave.basicComponentCode} ${money(leave.basicAmount)} / ${leave.dayDivisor} x ${leave.unpaidDays} = ${money(leave.amount)}.`
  );
  writer.text(
    leave.treatment === 'BEFORE_STATUTORY'
      ? 'Included in reduced basic earnings before statutory calculation.'
      : 'Included as a separate deduction after statutory calculation.'
  );
  writer.space();
};
const components = (writer: PdfWriter, slip: PdfPayslipPayload) => {
  writer.text('Components', true);
  for (const line of slip.presentation?.lines ?? [])
    writer.text(`${line.name} | ${line.componentType || '-'} | ${money(line.amount)}`);
};
const settlement = (writer: PdfWriter, slip: PdfPayslipPayload) => {
  const statement = slip.presentation?.statement;
  if (!statement) return;
  if (statement.loans && statement.loans.lines.length > 0) {
    writer.space();
    for (const line of payslipLoanText(statement.loans, money)) writer.text(line);
  }
  writer.space();
  writer.text(
    `Leave without pay: ${statement.lwp_days} days. Gross basis ${money(statement.lwp_basis_amount)} / ${statement.lwp_divisor}. LWP adjustment ${money(statement.lwp_amount)} is already included in earned gross.`
  );
  writer.text(`Net earnings: ${money(statement.net_earned)}`);
  writer.text(`Advance already paid: ${money(statement.advance_already_paid)}`);
  writer.text(`Remaining payable: ${money(statement.remaining_payable)}`, true);
};
export const createPayslipPdf = (
  branding: PayslipPdfBranding,
  slip: PdfPayslipPayload,
  _label: (line: PdfPayslipLine) => string
) => {
  if (!slip.presentation) throw new Error('Payslip display settings must be loaded before export.');
  if (resolvePayslipTemplate(slip.presentation.template) === 'TABLE')
    return createTablePayslipPdf(branding, slip);
  const writer = new PdfWriter();
  header(writer, branding, slip);
  legacyLeave(writer, slip);
  components(writer, slip);
  writer.space();
  writer.text(`Gross: ${money(slip.grossSalary)}`, true);
  writer.text(`Total deductions: ${money(slip.totalDeductions)}`, true);
  writer.text(`Net pay: ${money(slip.netSalary)}`, true);
  settlement(writer, slip);
  writer.space();
  writer.text('System generated. For discrepancies, contact HR.');
  return writer.doc;
};
