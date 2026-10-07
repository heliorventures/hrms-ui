import type { SaveCourseInput, SaveSkillInput } from '../../api/graphql/graphql';

import type { SetupField } from './performanceSetupEditor';

export { SaveSkillDocument, SaveCourseDocument } from '../../api/graphql/graphql';

export const skillFields: SetupField[] = [
  { key: 'name', label: 'Name', required: true, maxLength: 255 },
  { key: 'category', label: 'Category', maxLength: 100 },
  { key: 'level', label: 'Level', maxLength: 50 },
];
export const courseFields: SetupField[] = [
  { key: 'title', label: 'Title', required: true, maxLength: 500 },
  { key: 'category', label: 'Category', maxLength: 100 },
  { key: 'deliveryMode', label: 'Delivery mode', maxLength: 50 },
  { key: 'durationMinutes', label: 'Duration (minutes)', type: 'number' },
  { key: 'isMandatory', label: 'Mandatory', type: 'checkbox' },
];

const optionalText = (value: string | boolean) => String(value).trim() || null;
export function skillInput(
  id: string | undefined,
  values: Record<string, string | boolean>
): SaveSkillInput {
  return {
    id: id ?? null,
    category: optionalText(values.category),
    name: String(values.name).trim(),
    level: optionalText(values.level),
  };
}

export function courseInput(
  id: string | undefined,
  values: Record<string, string | boolean>
): SaveCourseInput {
  return {
    id: id ?? null,
    category: optionalText(values.category),
    title: String(values.title).trim(),
    deliveryMode: optionalText(values.deliveryMode),
    durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : null,
    isMandatory: Boolean(values.isMandatory),
  };
}
