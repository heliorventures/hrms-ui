export { SaveJobPostingDocument as SaveJobPosting } from '../../api/graphql/graphql';

export function validateJobPosting(input: {
  title: string;
  vacancies: number;
  openDate: string;
  closeDate: string;
}): string | null {
  if (!input.title.trim()) return 'Enter a job title.';
  if (!Number.isInteger(input.vacancies) || input.vacancies < 1)
    return 'Vacancies must be a positive whole number.';
  if (input.openDate && input.closeDate && input.closeDate < input.openDate)
    return 'Close date must be on or after open date.';
  return null;
}
