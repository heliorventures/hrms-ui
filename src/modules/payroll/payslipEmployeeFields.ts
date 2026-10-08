export const PAYSLIP_EMPLOYEE_FIELDS = [
  { id: 'EMPLOYEE_NAME', label: 'Employee name' },
  { id: 'EMPLOYEE_CODE', label: 'Employee code' },
  { id: 'DEPARTMENT', label: 'Department' },
  { id: 'DESIGNATION', label: 'Designation' },
  { id: 'JOINING_DATE', label: 'Joining date' },
  { id: 'GENDER', label: 'Gender' },
  { id: 'MARITAL_STATUS', label: 'Marital status' },
  { id: 'UAN', label: 'UAN' },
  { id: 'ESIC', label: 'ESIC' },
  { id: 'PAYSLIP_STATUS', label: 'Status' },
  { id: 'GENERATED_DATE', label: 'Generated date' },
] as const;

export const DEFAULT_PAYSLIP_EMPLOYEE_FIELDS = ['EMPLOYEE_NAME', 'EMPLOYEE_CODE', 'UAN', 'ESIC'];

export const decodePayslipEmployeeFields = (value: unknown): string[] => {
  if (value === undefined || value === null) return [...DEFAULT_PAYSLIP_EMPLOYEE_FIELDS];
  if (
    !Array.isArray(value) ||
    !value.every(
      (field: unknown): field is string =>
        typeof field === 'string' && PAYSLIP_EMPLOYEE_FIELDS.some(({ id }) => id === field)
    ) ||
    new Set(value).size !== value.length
  ) {
    throw new Error(
      'The company payslip employee fields are invalid. Contact your payroll administrator.'
    );
  }
  return [...value];
};
