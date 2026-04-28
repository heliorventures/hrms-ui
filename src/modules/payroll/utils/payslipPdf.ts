import { jsPDF } from 'jspdf';

/** Minimal line slip shape for PDF generation (compatible with UI `PayslipLine`; `id` optional). */
export type PdfPayslipLine = {
  id?: string;
  salaryComponentId: string;
  amount: string;
  componentType?: string | null;
};

export type PdfPayslipPayload = {
  grossSalary: string;
  totalDeductions: string;
  netSalary: string;
  status: string;
  generatedAt: string;
  lines: PdfPayslipLine[];
  pfEmployee?: string | null;
  esiEmployee?: string | null;
  tdsAmount?: string | null;
  professionalTax?: string | null;
};

const fmtPdf = (n: string) => {
  const v = Number(n);
  if (Number.isNaN(v))
    return n;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(v);
};

export type PayslipPdfBranding = {
  companyLine: string;
  periodLabel: string;
  employeeName: string;
  employeeCode: string;
};

/** Simple A4 portrait payslip PDF (offline; complements browser Print → Save as PDF). */
export function downloadPayslipPdf(
  branding: PayslipPdfBranding,
  slip: PdfPayslipPayload,
  labelForLine: (line: PdfPayslipLine) => string
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  let y = margin;
  const lineH = 14;
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(branding.companyLine, margin, y);
  y += lineH;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Payslip — ${branding.periodLabel}`, margin, y);
  y += lineH * 1.5;

  doc.text(`Employee: ${branding.employeeName}`, margin, y);
  doc.text(`Code: ${branding.employeeCode || '—'}`, pageW - margin - 120, y, { align: 'right' });
  y += lineH;
  doc.text(`Status: ${slip.status}`, margin, y);
  y += lineH;
  doc.text(
    `Generated: ${new Date(slip.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium' })}`,
    margin,
    y
  );
  y += lineH * 2;

  doc.setFont('helvetica', 'bold');
  doc.text('Components', margin, y);
  y += lineH;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const l of slip.lines) {
    const row = `${labelForLine(l)}  |  ${l.componentType || '—'}  |  ${fmtPdf(l.amount)}`;
    const lines = doc.splitTextToSize(row, pageW - 2 * margin);
    doc.text(lines, margin, y);
    y += lineH * Math.max(1, lines.length);
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  y += lineH;
  if (slip.pfEmployee) {
    doc.text(`PF (employee): ${fmtPdf(slip.pfEmployee)}`, margin, y);
    y += lineH;
  }
  if (slip.esiEmployee) {
    doc.text(`ESI (employee): ${fmtPdf(slip.esiEmployee)}`, margin, y);
    y += lineH;
  }
  if (slip.professionalTax) {
    doc.text(`Professional tax: ${fmtPdf(slip.professionalTax)}`, margin, y);
    y += lineH;
  }
  if (slip.tdsAmount) {
    doc.text(`TDS: ${fmtPdf(slip.tdsAmount)}`, margin, y);
    y += lineH;
  }

  y += lineH;
  doc.setFont('helvetica', 'bold');
  doc.text(`Gross: ${fmtPdf(slip.grossSalary)}`, margin, y);
  y += lineH;
  doc.text(`Total deductions: ${fmtPdf(slip.totalDeductions)}`, margin, y);
  y += lineH * 1.2;
  doc.setFontSize(11);
  doc.text(`Net pay: ${fmtPdf(slip.netSalary)}`, margin, y);
  y += lineH * 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text('System generated. For discrepancies, contact HR.', margin, y);

  const safePeriod = branding.periodLabel.replace(/\s+/g, '-').slice(0, 40);
  doc.save(`payslip-${safePeriod}.pdf`);
}
