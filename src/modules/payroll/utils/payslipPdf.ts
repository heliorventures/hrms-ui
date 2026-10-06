import type { PayslipPresentation } from '../payslipPresentation';
import type { UnpaidLeaveSnapshot } from '../unpaidLeaveDocuments';

import { createPayslipPdf } from './payslipPdfLayout';

/** Minimal line slip shape for PDF generation (compatible with UI `PayslipLine`; `id` optional). */
export type PdfPayslipLine = {
  id?: string;
  salaryComponentId: string;
  amount: string;
  componentType?: string | null;
};

export type PdfPayslipPayload = {
  uanNumber?: string | null;
  esicNumber?: string | null;
  presentation?: PayslipPresentation | null;
  unpaidLeave?: UnpaidLeaveSnapshot | null;
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

export type PayslipPdfBranding = {
  companyLine: string;
  periodLabel: string;
  employeeName: string;
  employeeCode: string;
  /** Raster logo (PNG/JPEG direct; WebP/SVG converted to JPEG for jsPDF). */
  logoForPdf?: { dataUrl: string; format: 'PNG' | 'JPEG' } | null;
};

/** Draw WebP, SVG, or non-PNG/JPEG blobs to JPEG for jsPDF. */
async function rasterizeImageBlobForPdf(
  blob: Blob
): Promise<{ dataUrl: string; format: 'JPEG' } | null> {
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

const rasterFormat = (mime: string, dataUrl: string): 'JPEG' | 'PNG' | null => {
  if (mime.includes('jpeg') || mime.includes('jpg') || dataUrl.startsWith('data:image/jpeg'))
    return 'JPEG';
  if (mime.includes('png') || dataUrl.startsWith('data:image/png')) return 'PNG';
  return null;
};

/** Fetch tenant logo bytes via HMAC URL; returns data URL + jsPDF format. */
export async function loadLogoDataUrlForPdf(
  signedUrl: string
): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' } | null> {
  try {
    const res = await fetch(signedUrl, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const mime = blob.type.toLowerCase();
    const dataUrl = await blobToDataUrl(blob);
    const format = rasterFormat(mime, dataUrl);
    if (format) return { dataUrl, format };
    return mime.startsWith('image/') ? await rasterizeImageBlobForPdf(blob) : null;
  } catch {
    return null;
  }
}

/** Export the same company-controlled component presentation used by print. */
export function downloadPayslipPdf(
  branding: PayslipPdfBranding,
  slip: PdfPayslipPayload,
  labelForLine: (line: PdfPayslipLine) => string
) {
  const doc = createPayslipPdf(branding, slip, labelForLine);
  const safePeriod = branding.periodLabel.replace(/\s+/g, '-').slice(0, 40);
  doc.save(`payslip-${safePeriod}.pdf`);
}
