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
  /** Raster logo (PNG/JPEG direct; WebP/SVG converted to JPEG for jsPDF). */
  logoForPdf?: { dataUrl: string; format: 'PNG' | 'JPEG' } | null;
};

/** Draw WebP, SVG, or non-PNG/JPEG blobs to JPEG for jsPDF. */
async function rasterizeImageBlobForPdf(blob: Blob): Promise<{ dataUrl: string; format: 'JPEG' } | null> {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return null;
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('img'));
      i.src = url;
    });
    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    if (!(srcW > 0) || !(srcH > 0)) return null;
    const maxW = 560;
    const scale = Math.min(1, maxW / srcW);
    const w = Math.round(srcW * scale);
    const h = Math.round(srcH * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.9), format: 'JPEG' };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(blob);
  });
}

/** Fetch tenant logo bytes via HMAC URL; returns data URL + jsPDF format. */
export async function loadLogoDataUrlForPdf(
  signedUrl: string
): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' } | null> {
  try {
    const res = await fetch(signedUrl, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const mime = (blob.type || '').toLowerCase();
    const dataUrl = await blobToDataUrl(blob);
    if (mime.includes('jpeg') || mime.includes('jpg')) return { dataUrl, format: 'JPEG' };
    if (mime.includes('png')) return { dataUrl, format: 'PNG' };
    if (dataUrl.startsWith('data:image/jpeg')) return { dataUrl, format: 'JPEG' };
    if (dataUrl.startsWith('data:image/png')) return { dataUrl, format: 'PNG' };
    if (mime.includes('webp') || mime.includes('svg') || mime.startsWith('image/')) {
      const raster = await rasterizeImageBlobForPdf(blob);
      if (raster) return raster;
    }
    return null;
  } catch {
    return null;
  }
}

/** Simple A4 portrait payslip PDF (offline; complements browser Print → Save as PDF). */
export async function downloadPayslipPdf(
  branding: PayslipPdfBranding,
  slip: PdfPayslipPayload,
  labelForLine: (line: PdfPayslipLine) => string
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  let y = margin;
  const lineH = 14;
  const pageW = doc.internal.pageSize.getWidth();

  const logo = branding.logoForPdf;
  if (logo) {
    const logoH = 40;
    const logoW = 44;
    try {
      doc.addImage(logo.dataUrl, logo.format, margin, y - 4, logoW, logoH);
    } catch {
      /* corrupt or unsupported image */
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(branding.companyLine, margin + logoW + 12, y + 12);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(branding.companyLine, margin, y);
  }
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
