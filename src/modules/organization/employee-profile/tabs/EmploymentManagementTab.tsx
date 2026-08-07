import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';
import { History, Settings2, Wallet } from 'lucide-react';

import type { EmployeeProfileModel, EmploymentStatusUi } from '../types';
import { InfoCard } from '../components/InfoCard';
import { EmploymentStatusBadge } from '../components/StatusBadge';
import { SalaryTimeline } from '../components/SalaryTimeline';
import { LifecycleTimeline } from '../components/LifecycleTimeline';
import { EmploymentActionModals } from '../components/EmploymentActionModals';
import Button from '../../../../components/common/Button';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';
import { formatCompactDate, formatInrAnnual } from '../lib/masking';
import {
  ExpensePolicyDirectoryDocument,
  OrgChartDocument,
  PayrollSetEmployeeCompensationDocument,
  UpdateEmployeeDocument,
} from '../../../../api/graphql/graphql';

interface EmploymentManagementTabProps {
  employeeId: string;
  client: GraphQLClient;
  model: EmployeeProfileModel;
  onChanged?: () => void;
}

const NO_MANAGER_CHANGE = '__NOCHANGE__';
const CLEAR_MANAGER = '__CLEAR__';

function statusUiToApi(status: EmploymentStatusUi): string {
  switch (status) {
    case 'TERMINATED':
      return 'TERMINATED';
    case 'ON_LEAVE':
      return 'ON_LEAVE';
    case 'SUSPENDED':
      return 'SUSPENDED';
    default:
      return 'ACTIVE';
  }
}

export function EmploymentManagementTab({
  employeeId,
  client,
  model,
  onChanged,
}: EmploymentManagementTabProps) {
  const [statusUi, setStatusUi] = useState<EmploymentStatusUi>(model.statusUi);
  const [statusSaving, setStatusSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerErr, setBannerErr] = useState<string | null>(null);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [termEffective, setTermEffective] = useState('');
  const [termReason, setTermReason] = useState('');
  const [newSalaryAnnual, setNewSalaryAnnual] = useState(String(model.compensation.baseSalaryAnnual));
  const [salaryEffective, setSalaryEffective] = useState('');
  const [salaryReason, setSalaryReason] = useState('');
  const [salarySaving, setSalarySaving] = useState(false);
  const [departmentId, setDepartmentId] = useState(model.core.departmentId ?? '');
  const [designationId, setDesignationId] = useState(model.core.designationId ?? '');
  const [managerChoice, setManagerChoice] = useState<string>(NO_MANAGER_CHANGE);
  const [roleEffective, setRoleEffective] = useState('');
  const [roleSaving, setRoleSaving] = useState(false);
  const [orgLoading, setOrgLoading] = useState(true);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [designations, setDesignations] = useState<{ id: string; title: string }[]>([]);
  const [orgRows, setOrgRows] = useState<{ employeeId: string; fullName: string; employeeCode: string }[]>([]);

  useEffect(() => {
    setStatusUi(model.statusUi);
  }, [model.statusUi]);

  useEffect(() => {
    setDepartmentId(model.core.departmentId ?? '');
    setDesignationId(model.core.designationId ?? '');
    setNewSalaryAnnual(String(model.compensation.baseSalaryAnnual));
  }, [model.core.departmentId, model.core.designationId, model.compensation.baseSalaryAnnual]);

  useEffect(() => {
    if (!roleOpen) return;
    setDepartmentId(model.core.departmentId ?? '');
    setDesignationId(model.core.designationId ?? '');
    setManagerChoice(NO_MANAGER_CHANGE);
    setRoleEffective('');
  }, [roleOpen, model.core.departmentId, model.core.designationId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setOrgLoading(true);
      try {
        const [directory, chart] = await Promise.all([
          client.request(ExpensePolicyDirectoryDocument, { lim: 320 }),
          client.request(OrgChartDocument, { limit: 500 }),
        ]);
        if (cancelled) return;
        setDepartments(directory.departments.map((department) => ({ id: department.id, name: department.name })));
        setDesignations(
          directory.designations.map((designation) => ({
            id: designation.id,
            title: designation.title,
          }))
        );
        setOrgRows(
          chart.orgChart.map((row) => ({
            employeeId: row.employeeId,
            fullName: row.fullName,
            employeeCode: row.employeeCode,
          }))
        );
      } catch (err) {
        if (!cancelled) setBannerErr(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setOrgLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const managerOptions = useMemo(
    () =>
      orgRows
        .filter((row) => row.employeeId !== employeeId)
        .map((row) => ({
          value: row.employeeId,
          label: `${row.fullName} (${row.employeeCode})`,
        })),
    [orgRows, employeeId]
  );

  const patchEmployeeStatus = useCallback(
    async (next: EmploymentStatusUi) => {
      setStatusSaving(true);
      setBanner(null);
      setBannerErr(null);
      try {
        await client.request(UpdateEmployeeDocument, {
          input: { id: employeeId, status: statusUiToApi(next) },
        });
        setStatusUi(next);
        setBanner('Employment status updated.');
        onChanged?.();
      } catch (err) {
        setBannerErr(graphQlUserMessage(err));
      } finally {
        setStatusSaving(false);
      }
    },
    [client, employeeId, onChanged]
  );

  const pctHike = useMemo(() => {
    const previous = model.compensation.baseSalaryAnnual;
    const next = Number(newSalaryAnnual.replace(/[^0-9.]/g, '')) || 0;
    return previous <= 0 ? 0 : ((next - previous) / previous) * 100;
  }, [model.compensation.baseSalaryAnnual, newSalaryAnnual]);

  const saveSalary = async () => {
    if (!salaryEffective) {
      setBannerErr('Choose an effective date for the salary change.');
      return;
    }
    const annual = Number(newSalaryAnnual.replace(/[^0-9.]/g, '')) || 0;
    if (annual <= 0) {
      setBannerErr('Enter a valid annual base salary.');
      return;
    }
    setSalarySaving(true);
    setBanner(null);
    setBannerErr(null);
    try {
      await client.request(PayrollSetEmployeeCompensationDocument, {
        input: {
          employeeId,
          monthlySalary: (annual / 12).toFixed(2),
          effectiveFrom: salaryEffective.slice(0, 10),
          changeReason: salaryReason.trim() || undefined,
        },
      });
      setSalaryOpen(false);
      setBanner('Compensation updated.');
      onChanged?.();
    } catch (err) {
      setBannerErr(graphQlUserMessage(err));
    } finally {
      setSalarySaving(false);
    }
  };

  const saveRole = async () => {
    setRoleSaving(true);
    setBanner(null);
    setBannerErr(null);
    try {
      const input: {
        id: string;
        departmentId?: string;
        designationId?: string;
        reportingManagerId?: string | null;
      } = { id: employeeId };
      if (departmentId) input.departmentId = departmentId;
      if (designationId) input.designationId = designationId;
      if (managerChoice === CLEAR_MANAGER) input.reportingManagerId = null;
      else if (managerChoice !== NO_MANAGER_CHANGE) input.reportingManagerId = managerChoice;
      await client.request(UpdateEmployeeDocument, { input });
      setRoleOpen(false);
      setBanner('Role and reporting updated.');
      onChanged?.();
    } catch (err) {
      setBannerErr(graphQlUserMessage(err));
    } finally {
      setRoleSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {banner ? (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
          {banner}
        </div>
      ) : null}
      {bannerErr ? (
        <div className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-2 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {bannerErr}
        </div>
      ) : null}
      {orgLoading ? <p className="text-xs text-slate-500">Loading org directory...</p> : null}

      <InfoCard title="Employment status" subtitle="HR actions - impacts payroll and access">
        <div className="flex flex-wrap items-center gap-2">
          <EmploymentStatusBadge status={statusUi} />
          {statusUi !== 'ACTIVE' ? (
            <Button type="button" size="sm" variant="secondary" disabled={statusSaving} onClick={() => void patchEmployeeStatus('ACTIVE')}>
              Activate
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" disabled={statusSaving} onClick={() => void patchEmployeeStatus('ON_LEAVE')}>
            Mark on leave
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={statusSaving} onClick={() => void patchEmployeeStatus('SUSPENDED')}>
            Suspend
          </Button>
          <Button type="button" size="sm" variant="danger" disabled={statusSaving} onClick={() => setTerminateOpen(true)}>
            Terminate
          </Button>
        </div>
      </InfoCard>

      <InfoCard
        title="Compensation"
        subtitle={`Last updated ${formatCompactDate(model.compensation.lastUpdatedAt)}`}
        action={<Button type="button" size="sm" variant="primary" onClick={() => setSalaryOpen(true)}>Update salary</Button>}
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-50/90 p-4 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              <Wallet className="h-4 w-4" aria-hidden />
              Current base (annual)
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatInrAnnual(model.compensation.baseSalaryAnnual, true)}
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              {model.compensation.components.map((component) => (
                <li key={component.code} className="flex justify-between gap-2">
                  <span>{component.label}</span>
                  <span className="tabular-nums">{formatInrAnnual(component.amountAnnual, true)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              <History className="h-4 w-4" aria-hidden />
              Salary history
            </div>
            <SalaryTimeline entries={model.salaryHistory} showAmounts />
          </div>
        </div>
      </InfoCard>

      <InfoCard
        title="Role & reporting"
        subtitle="Updates department, designation, and reporting manager"
        action={<Button type="button" size="sm" variant="outline" onClick={() => setRoleOpen(true)}>Change</Button>}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            ['Designation', model.roleAssignment.designation],
            ['Department', model.roleAssignment.department],
            ['Manager', model.roleAssignment.reportingManagerName],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/50">
              <p className="text-[11px] font-semibold uppercase text-slate-400">{label}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="Lifecycle" subtitle="Unified employment events">
        <LifecycleTimeline events={model.lifecycleEvents} />
      </InfoCard>

      <InfoCard
        title="Company assignments"
        subtitle="Leave policy, shift, location, grade"
        action={
          <Button type="button" size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
            <Settings2 className="mr-1 h-4 w-4" aria-hidden />
            Update
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ['Leave policy', model.companyAssignment.leavePolicyName],
            ['Shift', model.companyAssignment.shiftName],
            ['Location', model.companyAssignment.locationName],
            ['Grade / band', model.companyAssignment.gradeBand],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
              <p className="text-[11px] font-semibold uppercase text-slate-400">{label}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <EmploymentActionModals
        assignOpen={assignOpen}
        departmentId={departmentId}
        departments={departments}
        designationId={designationId}
        designations={designations}
        managerChoice={managerChoice}
        managerOptions={managerOptions}
        newSalaryAnnual={newSalaryAnnual}
        pctHike={pctHike}
        roleEffective={roleEffective}
        roleOpen={roleOpen}
        roleSaving={roleSaving}
        salaryEffective={salaryEffective}
        salaryOpen={salaryOpen}
        salaryReason={salaryReason}
        salarySaving={salarySaving}
        statusSaving={statusSaving}
        termEffective={termEffective}
        termReason={termReason}
        terminateOpen={terminateOpen}
        onAssignClose={() => setAssignOpen(false)}
        onDepartmentChange={setDepartmentId}
        onDesignationChange={setDesignationId}
        onManagerChoiceChange={setManagerChoice}
        onNewSalaryAnnualChange={setNewSalaryAnnual}
        onRoleClose={() => setRoleOpen(false)}
        onRoleEffectiveChange={setRoleEffective}
        onSalaryClose={() => setSalaryOpen(false)}
        onSalaryEffectiveChange={setSalaryEffective}
        onSalaryReasonChange={setSalaryReason}
        onSaveRole={() => void saveRole()}
        onSaveSalary={() => void saveSalary()}
        onTermEffectiveChange={setTermEffective}
        onTermReasonChange={setTermReason}
        onTerminateClose={() => setTerminateOpen(false)}
        onTerminateConfirm={() => void patchEmployeeStatus('TERMINATED')}
      />
    </div>
  );
}
