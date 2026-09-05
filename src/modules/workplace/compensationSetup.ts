import { gql } from 'graphql-request';

export type CompensationSetupKind = 'cycle' | 'band';
export type CompensationSetupValues = Partial<Record<string, string>>;
export const saveCompensationCycleDocument = gql`
  mutation SaveCompensationReviewCycle($input: SaveCompensationReviewCycleInput!) {
    saveCompensationReviewCycle(input: $input) {
      id
    }
  }
`;
export const saveSalaryBandDocument = gql`
  mutation SaveSalaryBand($input: SaveSalaryBandInput!) {
    saveSalaryBand(input: $input) {
      id
    }
  }
`;
export function validateCompensationSetup(
  kind: CompensationSetupKind,
  values: CompensationSetupValues
): string | null {
  if (kind === 'cycle') {
    if (!values.name?.trim() || (values.name?.trim().length ?? 0) > 200)
      return 'Enter a name of at most 200 characters.';
    if (!/^\d{4}$/.test(values.year ?? '') || Number(values.year) < 1900)
      return 'Enter a valid year.';
    if (!values.startDate || !values.endDate || values.startDate > values.endDate)
      return 'End date must be on or after start date.';
  } else {
    if (!values.designationId) return 'Select a designation.';
    if (values.currency && !/^[A-Za-z]{3}$/.test(values.currency.trim()))
      return 'Enter a three-letter currency code.';
    if (values.grade && (!/^\d+$/.test(values.grade) || Number(values.grade) > 2147483647))
      return 'Enter a valid nonnegative grade.';
    if (
      values.effectiveYear &&
      (!/^\d{4}$/.test(values.effectiveYear) || Number(values.effectiveYear) < 1900)
    )
      return 'Enter a valid year.';
  }
  const fields = kind === 'cycle' ? ['budgetPercentage'] : ['minSalary', 'midSalary', 'maxSalary'];
  for (const field of fields)
    if (values[field] && !/^\d{1,11}(\.\d{1,4})?$/.test((values[field] ?? '').trim()))
      return 'Enter nonnegative amounts with at most four decimal places.';
  const amounts = fields.filter((f) => values[f]?.trim()).map((f) => Number(values[f]));
  if (kind === 'band' && amounts.some((v, i) => i > 0 && v < amounts[i - 1]))
    return 'Salary values must be ordered minimum, midpoint, maximum.';
  return null;
}

export const compensationSetupPageDocument = gql`
  query CompensationSetupPage($offset: Int!) {
    salaryBands(limit: 21, offset: $offset) {
      id
      tenantId
      designationId
      grade
      minSalary
      midSalary
      maxSalary
      currency
      effectiveYear
    }
    compensationReviewCycles(limit: 21, offset: $offset) {
      id
      tenantId
      name
      year
      startDate
      endDate
      status
      budgetPercentage
    }
  }
`;
export const compensationDesignationsDocument = gql`
  query CompensationDesignations($offset: Int!) {
    designations(limit: 200, offset: $offset) {
      id
      title
    }
  }
`;
