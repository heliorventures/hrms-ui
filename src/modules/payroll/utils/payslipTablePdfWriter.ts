import { jsPDF } from 'jspdf';

/** Rows wrap and split across pages; repeated headings are supplied by the current section. */
export class PayslipTablePdfWriter {
  readonly doc = new jsPDF({ unit: 'pt', format: 'a4' });
  readonly width = this.doc.internal.pageSize.getWidth() - 72;
  y = 36;
  repeatHeading: (() => void) | null = null;
  private readonly bottom = this.doc.internal.pageSize.getHeight() - 42;

  private nextPage() {
    this.doc.addPage();
    this.y = 36;
    this.repeatHeading?.();
  }

  row(values: string[], widths: number[], bold = false, rightColumns: number[] = []) {
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    this.doc.setFontSize(9);
    const lines = values.map(
      (value, index) => this.doc.splitTextToSize(value, widths[index] - 12) as string[]
    );
    const count = Math.max(1, ...lines.map((value) => value.length));
    let offset = 0;
    while (offset < count) {
      if (this.bottom - this.y < 24) this.nextPage();
      const capacity = Math.max(1, Math.floor((this.bottom - this.y - 12) / 12));
      const take = Math.min(count - offset, capacity);
      this.drawSegment(lines, widths, offset, take, bold, rightColumns);
      offset += take;
      if (offset < count) this.nextPage();
    }
  }

  private drawSegment(
    lines: string[][],
    widths: number[],
    offset: number,
    take: number,
    bold: boolean,
    rightColumns: number[]
  ) {
    const height = take * 12 + 12;
    let x = 36;
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    this.doc.setFontSize(9);
    this.doc.setDrawColor(140);
    this.doc.setTextColor(25);
    widths.forEach((width, index) => {
      this.doc.rect(x, this.y, width, height);
      const align = rightColumns.includes(index) ? 'right' : 'left';
      const textX = align === 'right' ? x + width - 6 : x + 6;
      lines[index].slice(offset, offset + take).forEach((text, row) => {
        this.doc.text(text, textX, this.y + 15 + row * 12, { align });
      });
      x += width;
    });
    this.y += height;
  }

  text(value: string, bold = false) {
    this.row([value], [this.width], bold);
  }

  space() {
    this.y += 12;
  }

  finish() {
    const pages = this.doc.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      this.doc.setPage(page);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.text(`Page ${page} of ${pages}`, 36 + this.width, this.bottom + 20, {
        align: 'right',
      });
    }
    return this.doc;
  }
}
