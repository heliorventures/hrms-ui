import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  AssignAnnualCtcSection,
  SalaryBreakupPreviewSection,
  SalaryComponentsSection,
  SalaryStructureSection,
} from './PayrollCompensationSections';
import type {
  AssignmentForm,
  BoardResult,
  ComponentForm,
  SalaryBreakupPreview,
  StructureDraftLine,
} from './payrollCompensationTypes';

const COMPENSATION_BOARD_QUERY = /* GraphQL */ `
  query PayrollCompensationBoard($employeeLimit: Int! = 300) {
    employees(limit: $employeeLimit) {
      id
      employeeCode
      fullName
      status
      dateOfJoining
    }
    salaryComponents(limit: 200) {
      id
      name
      code
      componentType
      isTaxable
      isFixed
      isActive
    }
    salaryStructures(limit: 100) {
      id
      name
      description
      components {
        id
        salaryComponentId
        componentName
        componentCode
        componentType
        calculationBasis
        calculationValue
        displayOrder
      }
    }
  }
`;

const UPSERT_SALARY_COMPONENT = /* GraphQL */ `
  mutation UpsertSalaryComponent($input: UpsertSalaryComponentInput!) {
    upsertSalaryComponent(input: $input) {
      id
      name
      code
      componentType
      isActive
    }
  }
`;

const UPSERT_SALARY_STRUCTURE = /* GraphQL */ `
  mutation UpsertSalaryStructure($input: UpsertSalaryStructureInput!) {
    upsertSalaryStructure(input: $input) {
      id
      name
      components {
        id
        componentCode
        calculationBasis
        calculationValue
      }
    }
  }
`;

const ASSIGN_EMPLOYEE_SALARY_STRUCTURE = /* GraphQL */ `
  mutation AssignEmployeeSalaryStructure($input: AssignEmployeeSalaryStructureInput!) {
    assignEmployeeSalaryStructure(input: $input) {
      id
      employeeId
      salaryStructureId
      ctc
      effectiveFrom
    }
  }
`;

const SALARY_BREAKUP_PREVIEW = /* GraphQL */ `
  query EmployeeSalaryBreakupPreview($employeeId: ID, $asOf: NaiveDate) {
    employeeSalaryBreakupPreview(employeeId: $employeeId, asOf: $asOf) {
      employeeId
      annualCtc
      monthlyGross
      monthlyDeductions
      monthlyNetBeforeStatutory
      lines {
        salaryComponentId
        componentName
        componentCode
        componentType
        calculationBasis
        calculationValue
        annualAmount
        monthlyAmount
        isOverride
      }
    }
  }
`;

const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/;
const today = () => new Date().toISOString().slice(0, 10);

function validMoney(value: string): boolean {
  return MONEY_PATTERN.test(value.trim()) && Number(value) >= 0;
}

const defaultComponentForm: ComponentForm = {
  name: '',
  code: '',
  componentType: 'EARNING',
  isTaxable: true,
  isFixed: true,
};

const defaultLineDraft: StructureDraftLine = {
  salaryComponentId: '',
  calculationBasis: 'PERCENT_OF_CTC',
  calculationValue: '',
};

const PayrollCompensationPageContent = ({ canManagePayroll }: { canManagePayroll: boolean }) => {
  const client = useGraphClient('client');
  const [board, setBoard] = useState<BoardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [componentForm, setComponentForm] = useState<ComponentForm>(defaultComponentForm);
  const [structureName, setStructureName] = useState('');
  const [structureDescription, setStructureDescription] = useState('');
  const [structureLines, setStructureLines] = useState<StructureDraftLine[]>([]);
  const [lineDraft, setLineDraft] = useState<StructureDraftLine>(defaultLineDraft);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
    employeeId: '',
    salaryStructureId: '',
    annualCtc: '',
    effectiveFrom: today(),
  });
  const [preview, setPreview] = useState<SalaryBreakupPreview | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.request<BoardResult>(COMPENSATION_BOARD_QUERY, { employeeLimit: 300 });
      setBoard(result);
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedEmployee = useMemo(
    () => board?.employees.find((employee) => employee.id === assignmentForm.employeeId),
    [assignmentForm.employeeId, board?.employees]
  );

  const addComponent = async (event: FormEvent) => {
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

  const addStructureLine = () => {
    if (!canManagePayroll) return;
    if (!lineDraft.salaryComponentId || !validMoney(lineDraft.calculationValue)) {
      setActionError('Select a component and enter a valid calculation value.');
      return;
    }
    setStructureLines((lines) => [...lines, lineDraft]);
    setLineDraft(defaultLineDraft);
    setActionError(null);
  };

  const saveStructure = async (event: FormEvent) => {
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

  const assignStructure = async (event: FormEvent) => {
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
      const result = await client.request<{ employeeSalaryBreakupPreview: SalaryBreakupPreview | null }>(
        SALARY_BREAKUP_PREVIEW,
        { employeeId: assignmentForm.employeeId, asOf: assignmentForm.effectiveFrom }
      );
      setPreview(result.employeeSalaryBreakupPreview);
    } catch (e) {
      setActionError(graphQlUserMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Compensation</h1>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : null}
      {actionError ? (
        <Card>
          <p className="text-sm text-red-600">{actionError}</p>
        </Card>
      ) : null}
      {ok ? (
        <Card>
          <p className="text-sm text-emerald-700">{ok}</p>
        </Card>
      ) : null}

      <SalaryComponentsSection
        board={board}
        busy={busy}
        loading={loading}
        componentForm={componentForm}
        onComponentFormChange={setComponentForm}
        onSubmit={addComponent}
      />
      <SalaryStructureSection
        board={board}
        busy={busy}
        structureName={structureName}
        structureDescription={structureDescription}
        structureLines={structureLines}
        lineDraft={lineDraft}
        onStructureNameChange={setStructureName}
        onStructureDescriptionChange={setStructureDescription}
        onLineDraftChange={setLineDraft}
        onAddLine={addStructureLine}
        onSubmit={saveStructure}
      />
      <AssignAnnualCtcSection
        board={board}
        busy={busy}
        assignmentForm={assignmentForm}
        selectedJoiningDate={selectedEmployee?.dateOfJoining?.slice(0, 10)}
        onAssignmentFormChange={setAssignmentForm}
        onPreviewReset={() => setPreview(null)}
        onSubmit={assignStructure}
      />
      {preview ? <SalaryBreakupPreviewSection preview={preview} /> : null}
    </div>
  );
};

const PayrollCompensationPage = () => {
  const { clientSession } = useAuth();
  const permissions = useMemo(() => createPermissionService(clientSession), [clientSession]);
  const canManagePayroll = permissions.canCapability('action.payroll.manage');
  if (!canManagePayroll) return null;

  return (
    <PayrollCompensationPageContent
      key={authorizationStateKey(clientSession)}
      canManagePayroll={canManagePayroll}
    />
  );
};

export default PayrollCompensationPage;
