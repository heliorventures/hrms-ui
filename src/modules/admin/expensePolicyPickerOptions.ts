import type { UuidEntityOption } from '../../components/common/UuidEntitySearchSelect';
import type {
  ExpensePolicyDepartmentRow,
  ExpensePolicyDesignationRow,
  ExpensePolicyRoleRow,
} from './expenseCategoryTypes';
import { shortEntityId } from './expenseCategoryUtils';

function addUnknownOption(options: UuidEntityOption[], id: string, title: string) {
  const trimmed = id.trim();
  if (trimmed && !options.some((option) => option.id === trimmed)) {
    options.push({ id: trimmed, title, subtitle: shortEntityId(trimmed) });
  }
}

export function buildDepartmentOptions(
  departments: ExpensePolicyDepartmentRow[],
  selectedDepartmentId: string
): UuidEntityOption[] {
  const options = departments.map((department) => ({
    id: department.id,
    title: department.name,
    subtitle: department.code ?? undefined,
  }));
  addUnknownOption(options, selectedDepartmentId, 'Unknown department (from policy)');
  return options;
}

export function buildDesignationOptions(
  designations: ExpensePolicyDesignationRow[],
  departmentNameById: Map<string, string>,
  selectedDesignationId: string
): UuidEntityOption[] {
  const options = designations.map((designation) => {
    const level =
      typeof designation.level === 'number' && Number.isFinite(designation.level)
        ? designation.level
        : null;
    return {
      id: designation.id,
      title: level !== null ? `${designation.title} - L${level}` : designation.title,
      subtitle: designation.departmentId
        ? departmentNameById.get(designation.departmentId) ??
          `Dept ${shortEntityId(designation.departmentId)}`
        : undefined,
    };
  });
  addUnknownOption(options, selectedDesignationId, 'Unknown designation (from policy)');
  return options;
}

export function buildRoleOptions(
  roles: ExpensePolicyRoleRow[],
  selectedRoleId: string
): UuidEntityOption[] {
  const options = roles.map((role) => {
    const description = role.description?.trim();
    return {
      id: role.id,
      title: role.name + (role.isSystemRole ? ' (system)' : ''),
      subtitle: description && description.length > 96 ? `${description.slice(0, 96)}...` : description,
    };
  });
  addUnknownOption(options, selectedRoleId, 'Unknown role (from policy)');
  return options;
}
