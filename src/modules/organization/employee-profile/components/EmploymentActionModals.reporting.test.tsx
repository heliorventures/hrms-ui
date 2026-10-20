// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { EmploymentActionModals } from './EmploymentActionModals';

afterEach(cleanup);

const noop = vi.fn();
const props: ComponentProps<typeof EmploymentActionModals> = {
  assignOpen: false,
  departmentId: '',
  departments: [],
  designationId: '',
  designations: [],
  managerChoice: '__NOCHANGE__',
  managerOrganizationManaged: true,
  managerOptions: [],
  newSalaryAnnual: '',
  pctHike: 0,
  roleEffective: '',
  roleOpen: true,
  roleSaving: false,
  salaryEffective: '',
  salaryOpen: false,
  salaryReason: '',
  salarySaving: false,
  statusSaving: false,
  termEffective: '',
  termReason: '',
  terminateOpen: false,
  onAssignClose: noop,
  onDepartmentChange: noop,
  onDesignationChange: noop,
  onManagerChoiceChange: noop,
  onNewSalaryAnnualChange: noop,
  onRoleClose: noop,
  onRoleEffectiveChange: noop,
  onSalaryClose: noop,
  onSalaryEffectiveChange: noop,
  onSalaryReasonChange: noop,
  onSaveRole: noop,
  onSaveSalary: noop,
  onTermEffectiveChange: noop,
  onTermReasonChange: noop,
  onTerminateClose: noop,
  onTerminateConfirm: noop,
};

it('locks organization-managed manager selection while keeping local department/designation edits available', () => {
  const view = render(<EmploymentActionModals {...props} />);
  expect(screen.getByLabelText<HTMLSelectElement>('Reporting Manager').disabled).toBe(true);
  expect(screen.getByLabelText<HTMLSelectElement>('Department').disabled).toBe(false);
  expect(screen.getByText(/Reporting manager is organization-managed/)).toBeDefined();
  view.rerender(<EmploymentActionModals {...props} managerOrganizationManaged={false} />);
  expect(screen.getByLabelText<HTMLSelectElement>('Reporting Manager').disabled).toBe(false);
});
