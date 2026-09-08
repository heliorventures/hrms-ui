export function downloadReportCsv(fileName: string, csv: string) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.replace(/[\\/]/g, '-');
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
