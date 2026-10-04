import type { FormEvent } from 'react';

import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import type { CompensationState } from './hooks/useCompensationState';
import {
  UPSERT_SALARY_COMPONENT,
  UPSERT_SALARY_STRUCTURE,
  ASSIGN_EMPLOYEE_SALARY_STRUCTURE,
  defaultComponentForm,
  defaultLineDraft,
  validMoney,
} from './payrollCompensationQueries';

export const saveComponent = (state: CompensationState, canManagePayroll: boolean) => {
  const { componentForm, client, load, setBusy, setActionError, setOk, setComponentForm } = state;
  return async (event: FormEvent) => {
    event.preventDefault();
    if (!canManagePayroll) return;
    if (!componentForm.name.trim() || !componentForm.code.trim()) {
      setActionError('Component name and code are required.');
      return;
    }
    setBusy(true);
    setActionError(null);
    setOk(null);
    try {
      await client.request(UPSERT_SALARY_COMPONENT, {
        input: {
          name: componentForm.name.trim(),
          code: componentForm.code.trim(),
          componentType: componentForm.componentType,
          isTaxable: componentForm.isTaxable,
          isFixed: componentForm.isFixed,
          isActive: true,
          formulaExpression: null,
        },
      });
      setComponentForm(defaultComponentForm);
      setOk('Salary component saved.');
      await load();
    } catch (e) {
      setActionError(graphQlUserMessage(e));
    } finally {
      setBusy(false);
    }
  };
};
export const appendStructureLine = (state: CompensationState, canManagePayroll: boolean) => {
  const { lineDraft, setActionError, setStructureLines, setLineDraft } = state;
  return () => {
    if (!canManagePayroll) return;
    if (!lineDraft.salaryComponentId || !validMoney(lineDraft.calculationValue)) {
      setActionError('Select a component and enter a valid calculation value.');
      return;
    }
    setStructureLines((lines) => [...lines, lineDraft]);
    setLineDraft(defaultLineDraft);
    setActionError(null);
  };
};
export const saveSalaryStructure = (state: CompensationState, canManagePayroll: boolean) => {
  const {
    structureName,
    structureDescription,
    structureLines,
    client,
    load,
    setBusy,
    setActionError,
    setOk,
    setStructureName,
    setStructureDescription,
    setStructureLines,
  } = state;
  return async (event: FormEvent) => {
    event.preventDefault();
    if (!canManagePayroll) return;
    if (!structureName.trim()) {
      setActionError('Structure name is required.');
      return;
    }
    if (structureLines.length === 0) {
      setActionError('Add at least one component to the structure.');
      return;
    }
    setBusy(true);
    setActionError(null);
    setOk(null);
    try {
      await client.request(UPSERT_SALARY_STRUCTURE, {
        input: {
          name: structureName.trim(),
          description: structureDescription.trim() || null,
          components: structureLines.map((line, index) => ({
            salaryComponentId: line.salaryComponentId,
            calculationBasis: line.calculationBasis,
            calculationValue: line.calculationValue.trim(),
            displayOrder: index + 1,
          })),
        },
      });
      setStructureName('');
      setStructureDescription('');
      setStructureLines([]);
      setOk('Salary structure saved.');
      await load();
    } catch (e) {
      setActionError(graphQlUserMessage(e));
    } finally {
      setBusy(false);
    }
  };
};
export const assignSalary = (state: CompensationState, canManagePayroll: boolean) => {
  const { assignmentForm, client, setBusy, setActionError, setOk, setPreviewRevision } = state;
  return async (event: FormEvent) => {
    event.preventDefault();
    if (!canManagePayroll) return;
    if (!assignmentForm.employeeId || !assignmentForm.salaryStructureId) {
      setActionError('Select employee and salary structure.');
      return;
    }
    if (!validMoney(assignmentForm.annualCtc) || Number(assignmentForm.annualCtc) <= 0) {
      setActionError('Annual CTC must be a positive amount.');
      return;
    }
    setBusy(true);
    setActionError(null);
    setOk(null);
    try {
      await client.request(ASSIGN_EMPLOYEE_SALARY_STRUCTURE, {
        input: {
          employeeId: assignmentForm.employeeId,
          salaryStructureId: assignmentForm.salaryStructureId,
          annualCtc: assignmentForm.annualCtc.trim(),
          effectiveFrom: assignmentForm.effectiveFrom,
          effectiveTo: null,
          overrides: [],
        },
      });
      setOk('Employee salary structure assigned.');
      setPreviewRevision((value) => value + 1);
    } catch (e) {
      setActionError(graphQlUserMessage(e));
    } finally {
      setBusy(false);
    }
  };
};
