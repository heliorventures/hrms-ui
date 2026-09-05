import { gql } from 'graphql-request';

import type { SetupField } from './performanceSetupEditor';

export const SaveSkillDocument = gql`
  mutation SaveSkill($input: SaveSkillInput!) {
    saveSkill(input: $input) {
      id
    }
  }
`;
export const SaveCourseDocument = gql`
  mutation SaveCourse($input: SaveCourseInput!) {
    saveCourse(input: $input) {
      id
    }
  }
`;
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
export function learningInput(
  kind: 'skill' | 'course',
  id: string | undefined,
  values: Record<string, string | boolean>
) {
  const identity = { id: id ?? null, category: optionalText(values.category) };
  if (kind === 'skill')
    return { ...identity, name: String(values.name).trim(), level: optionalText(values.level) };
  return {
    ...identity,
    title: String(values.title).trim(),
    deliveryMode: optionalText(values.deliveryMode),
    durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : null,
    isMandatory: Boolean(values.isMandatory),
  };
}
