// Every template and PDF uses the same display value for document metadata.
export const payslipDetailValue = (detail: { field: string; value: string }): string =>
  detail.field === 'GENERATED_DATE'
    ? new Date(detail.value).toLocaleDateString('en-IN', { dateStyle: 'medium' })
    : detail.value;
