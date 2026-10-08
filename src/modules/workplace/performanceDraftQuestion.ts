export interface DraftQuestion {
  answerer: string;
  isRequired: boolean;
  key: string;
  managerRating: boolean;
  options: string;
  parentKey: string;
  prompt: string;
  selfRating: boolean;
  type: string;
}

export const performanceFieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

export const blankDraftQuestion = (index: number): DraftQuestion => ({
  key: `q${index}`,
  parentKey: '',
  prompt: '',
  type: 'LONG_TEXT',
  answerer: 'BOTH',
  isRequired: true,
  selfRating: true,
  managerRating: true,
  options: '',
});
