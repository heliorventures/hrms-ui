import { payslipCompanyAddressText } from '../payslipCompanyAddress';
import { payslipDetailValue } from '../payslipDetailValue';
import { payslipLoanText } from '../payslipLoans';
import { formatPayslipAmount, groupPayslipLines, payslipLineAt } from '../payslipTableData';

import type { PdfPayslipPayload, PayslipPdfBranding } from './payslipPdf';
import { PayslipTablePdfWriter } from './payslipTablePdfWriter';

const amount = (value: string) => `INR ${formatPayslipAmount(value)}`;

const drawHeader = (
  writer: PayslipTablePdfWriter,
  branding: PayslipPdfBranding,
  slip: PdfPayslipPayload
) => {
  const logo = branding.logoForPdf;
  if (logo) {
    try {
      const { width, height } = writer.doc.getImageProperties(logo.dataUrl);
      const scale = Math.min(80 / width, 48 / height);
      writer.doc.addImage(logo.dataUrl, logo.format, 36, writer.y, width * scale, height * scale);
      writer.y += 56;
    } catch {
      /* Export remains available if the optional logo cannot be read. */
    }
  }
  writer.text(branding.companyLine, true);
  const address = payslipCompanyAddressText(branding.companyAddress);
  if (address) writer.text(address);
  writer.text(`Payslip for ${branding.periodLabel}`, true);
  const half = writer.width / 2;
  const details = slip.presentation?.employeeDetails ?? [];
  for (let index = 0; index < details.length; index += 2) {
    const pair = details
      .slice(index, index + 2)
      .map((detail) => `${detail.label}: ${payslipDetailValue(detail)}`);
    writer.row([pair[0], pair[1] ?? ''], [half, half]);
  }
  writer.space();
};

const drawComponents = (writer: PayslipTablePdfWriter, slip: PdfPayslipPayload) => {
  const { earnings, deductions, other } = groupPayslipLines(slip.presentation?.lines ?? []);
  const widths = [0.3, 0.2, 0.3, 0.2].map((fraction) => writer.width * fraction);
  const heading = () =>
    writer.row(['Earnings', 'Amount (INR)', 'Deductions', 'Amount (INR)'], widths, true, [1, 3]);
  heading();
  writer.repeatHeading = heading;
  for (let index = 0; index < Math.max(earnings.length, deductions.length); index += 1) {
    const earning = payslipLineAt(earnings, index);
    const deduction = payslipLineAt(deductions, index);
    writer.row(
      [
        earning?.name ?? '',
        earning ? formatPayslipAmount(earning.amount) : '',
        deduction?.name ?? '',
        deduction ? formatPayslipAmount(deduction.amount) : '',
      ],
      widths,
      false,
      [1, 3]
    );
  }
  writer.repeatHeading = null;
  writer.row(
    [
      'Total earnings',
      formatPayslipAmount(slip.grossSalary),
      'Total deductions',
      formatPayslipAmount(slip.totalDeductions),
    ],
    widths,
    true,
    [1, 3]
  );
  if (other.length) {
    writer.space();
    writer.text('Other displayed components', true);
    for (const line of other)
      writer.row(
        [`${line.name} (${line.componentType})`, amount(line.amount)],
        [writer.width * 0.7, writer.width * 0.3],
        false,
        [1]
      );
  }
  writer.space();
  writer.row(
    ['Net pay', amount(slip.netSalary)],
    [writer.width * 0.7, writer.width * 0.3],
    true,
    [1]
  );
};

const drawSettlement = (writer: PayslipTablePdfWriter, slip: PdfPayslipPayload) => {
  const leave = slip.unpaidLeave;
  if (leave) {
    writer.space();
    writer.text(
      `Unpaid leave: ${leave.unpaidDays} days. ${leave.basicComponentCode} ${amount(leave.basicAmount)} / ${leave.dayDivisor} x ${leave.unpaidDays} = ${amount(leave.amount)}.`
    );
    writer.text(
      leave.treatment === 'BEFORE_STATUTORY'
        ? 'Already included in reduced basic earnings before statutory calculation.'
        : 'Included as a separate deduction after statutory calculation.'
    );
  }
  const statement = slip.presentation?.statement;
  if (!statement) return;
  if (statement.loans && statement.loans.lines.length > 0) {
    writer.space();
    for (const line of payslipLoanText(statement.loans, amount)) writer.text(line);
  }
  writer.space();
  writer.text(
    `Leave without pay: ${statement.lwp_days} days. Gross basis ${amount(statement.lwp_basis_amount)} / ${statement.lwp_divisor} days. LWP adjustment: ${amount(statement.lwp_amount)}. Already included in earned gross; not deducted again.`
  );
  writer.text('Salary settlement', true);
  writer.text(`Net earnings: ${amount(statement.net_earned)}`);
  writer.text(`Advance already paid: ${amount(statement.advance_already_paid)}`);
  writer.text(`Remaining payable: ${amount(statement.remaining_payable)}`, true);
};

export const createTablePayslipPdf = (branding: PayslipPdfBranding, slip: PdfPayslipPayload) => {
  if (!slip.presentation) throw new Error('Payslip display settings must be loaded before export.');
  const writer = new PayslipTablePdfWriter();
  drawHeader(writer, branding, slip);
  drawComponents(writer, slip);
  drawSettlement(writer, slip);
  writer.space();
  writer.text('System generated. For discrepancies, contact HR.');
  return writer.finish();
};
