import { useMemo } from 'react';

import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageTabs, { PageTabPanel } from '../../components/common/PageTabs';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTabs } from '../../hooks/usePageTabs';

import AssignedSalaryPreview from './components/AssignedSalaryPreview';
import CompanyPayslipComponents from './components/CompanyPayslipComponents';
import { useCompensationState } from './hooks/useCompensationState';
import {
  saveComponent,
  appendStructureLine,
  saveSalaryStructure,
  assignSalary,
} from './payrollCompensationActions';
import {
  AssignAnnualCtcSection,
  SalaryComponentsSection,
  SalaryStructureSection,
} from './PayrollCompensationSections';

const PayrollCompensationPageContent = ({ canManagePayroll }: { canManagePayroll: boolean }) => {
  const state = useCompensationState();
  const {
    client,
    board,
    loading,
    error,
    busy,
    ok,
    actionError,
    componentForm,
    setComponentForm,
    structureName,
    setStructureName,
    structureDescription,
    setStructureDescription,
    structureLines,
    lineDraft,
    setLineDraft,
    assignmentForm,
    setAssignmentForm,
    previewRevision,
    setPreviewRevision,
    selectedEmployee,
  } = state;
  const addComponent = saveComponent(state, canManagePayroll);
  const addStructureLine = appendStructureLine(state, canManagePayroll);
  const saveStructure = saveSalaryStructure(state, canManagePayroll);
  const assignStructure = assignSalary(state, canManagePayroll);
  const tabs = [
    { id: 'components', label: 'Salary Components' },
    { id: 'structures', label: 'Salary Structures' },
    { id: 'assignments', label: 'Assign Employee Salary' },
  ];
  const { tab, setTab } = usePageTabs(tabs);

  return (
    <div className="space-y-4">
      <div data-tour-anchor="payroll.compensation.sections">
        <PageTabs tabs={tabs} value={tab} onValueChange={setTab} />
      </div>
      <div>
        <h1 className="sr-only">Salary Setup</h1>
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

      <PageTabPanel id="components" activeTab={tab}>
        <CompanyPayslipComponents client={client} />
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setTab('structures')}>
            Next: Build Salary Structure
          </Button>
        </div>
        <div data-tour-anchor="payroll.compensation.components">
          <SalaryComponentsSection
            board={board}
            busy={busy}
            loading={loading}
            componentForm={componentForm}
            onComponentFormChange={setComponentForm}
            onSubmit={(event) => void addComponent(event)}
          />
        </div>
      </PageTabPanel>
      <PageTabPanel id="structures" activeTab={tab}>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setTab('assignments')}>
            Next: Assign Employee Salary
          </Button>
        </div>
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
          onSubmit={(event) => void saveStructure(event)}
        />
      </PageTabPanel>
      <PageTabPanel id="assignments" activeTab={tab}>
        <AssignAnnualCtcSection
          board={board}
          busy={busy}
          assignmentForm={assignmentForm}
          selectedJoiningDate={selectedEmployee?.dateOfJoining.slice(0, 10)}
          onAssignmentFormChange={setAssignmentForm}
          onPreviewReset={() => setPreviewRevision((value) => value + 1)}
          onSubmit={(event) => void assignStructure(event)}
        />
        <AssignedSalaryPreview
          client={client}
          employeeId={assignmentForm.employeeId}
          revision={previewRevision}
        />
      </PageTabPanel>
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
