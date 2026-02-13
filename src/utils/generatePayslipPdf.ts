import { jsPDF } from 'jspdf';
import type { Payslip } from '../types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatMonth = (month: string) => {
  const date = new Date(month + '-01');
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export function downloadPayslipPdf(payslip: Payslip, employeeName?: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(18);
  doc.text('PAYSLIP', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.text(formatMonth(payslip.month), pageWidth / 2, y, { align: 'center' });
  y += 8;

  if (employeeName) {
    doc.setFontSize(10);
    doc.text(`Employee: ${employeeName}`, pageWidth / 2, y, { align: 'center' });
    y += 8;
  }

  doc.text(`Generated On: ${new Date(payslip.generatedOn).toLocaleDateString('en-IN')}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  doc.setFontSize(11);
  doc.text('EARNINGS', 14, y);
  y += 8;

  const earnings = payslip.components.filter((c) => c.type === 'earning');
  earnings.forEach((c) => {
    doc.text(c.name, 20, y);
    doc.text(formatCurrency(c.amount), pageWidth - 20, y, { align: 'right' });
    y += 6;
  });

  doc.setFontSize(10);
  doc.text('Gross Salary', 20, y);
  doc.text(formatCurrency(payslip.grossSalary), pageWidth - 20, y, { align: 'right' });
  y += 10;

  doc.setFontSize(11);
  doc.text('DEDUCTIONS', 14, y);
  y += 8;

  const deductions = payslip.components.filter((c) => c.type === 'deduction');
  deductions.forEach((c) => {
    doc.text(c.name, 20, y);
    doc.text(`- ${formatCurrency(c.amount)}`, pageWidth - 20, y, { align: 'right' });
    y += 6;
  });

  doc.setFontSize(10);
  doc.text('Total Deductions', 20, y);
  doc.text(`- ${formatCurrency(payslip.totalDeductions)}`, pageWidth - 20, y, { align: 'right' });
  y += 12;

  doc.setFontSize(12);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;
  doc.text('NET SALARY', 20, y);
  doc.text(formatCurrency(payslip.netSalary), pageWidth - 20, y, { align: 'right' });

  doc.save(`Payslip-${payslip.month}.pdf`);
}
