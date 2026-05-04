import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { GraphQLClient } from 'graphql-request';
import { AlertTriangle, History, Settings2, Wallet } from 'lucide-react';

import type { EmployeeProfileModel, EmploymentStatusUi } from '../types';
import { InfoCard } from '../components/InfoCard';
import { EmploymentStatusBadge } from '../components/StatusBadge';
import { SalaryTimeline } from '../components/SalaryTimeline';
import { LifecycleTimeline } from '../components/LifecycleTimeline';
import { ConfirmationModal } from '../components/ConfirmationModal';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import Modal from '../../../../components/common/Modal';
import Select from '../../../../components/common/Select';
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

function statusUiToApi(s: EmploymentStatusUi): string {
  switch (s) {
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
  /** `__NOCHANGE__` | `__CLEAR__` | employee UUID */
  const [managerChoice, setManagerChoice] = useState<string>('__NOCHANGE__');
  const [roleEffective, setRoleEffective] = useState('');
  const [roleSaving, setRoleSaving] = useState(false);

  const [orgLoading, setOrgLoading] = useState(true);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [designations, setDesignations] = useState<{ id: string; title: string; departmentId?: string | null }[]>(
    []
  );
  const [orgRows, setOrgRows] = useState<
    { employeeId: string; fullName: string; employeeCode: string }[]
  >([]);

  useEffect(() => {
    setStatusUi(model.statusUi);
  }, [model.statusUi]);

  useEffect(() => {
    setDepartmentId(model.core.departmentId ?? '');
    setDesignationId(model.core.designationId ?? '');
    setNewSalaryAnnual(String(model.compensation.baseSalaryAnnual));
  }, [
    model.core.departmentId,
    model.core.designationId,
    model.compensation.baseSalaryAnnual,
  ]);

  useEffect(() => {
    if (roleOpen) {
      setDepartmentId(model.core.departmentId ?? '');
      setDesignationId(model.core.designationId ?? '');
      setManagerChoice('__NOCHANGE__');
      setRoleEffective('');
    }
  }, [roleOpen, model.core.departmentId, model.core.designationId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setOrgLoading(true);
      try {
        const [dir, chart] = await Promise.all([
          client.request(ExpensePolicyDirectoryDocument, { lim: 320 }),
          client.request(OrgChartDocument, { limit: 500 }),
        ]);
        if (cancelled) return;
        setDepartments(dir.departments.map((d) => ({ id: d.id, name: d.name })));
        setDesignations(
          dir.designations.map((d) => ({
            id: d.id,
            title: d.title,
            departmentId: d.departmentId ?? null,
          }))
        );
        setOrgRows(
          chart.orgChart.map((r) => ({
            employeeId: r.employeeId,
            fullName: r.fullName,
            employeeCode: r.employeeCode,
          }))
        );
      } catch (e) {
        if (!cancelled) {
          setBannerErr(e instanceof Error ? e.message : 'Could not load org directory');
        }
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
        .filter((r) => r.employeeId !== employeeId)
        .map((r) => ({
          value: r.employeeId,
          label: `${r.fullName} (${r.employeeCode})`,
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
      } catch (e) {
        setBannerErr(e instanceof Error ? e.message : 'Status update failed');
      } finally {
        setStatusSaving(false);
      }
    },
    [client, employeeId, onChanged]
  );

  const pctHike = useMemo(() => {
    const prev = model.compensation.baseSalaryAnnual;
    const next = Number(newSalaryAnnual.replace(/[^0-9.]/g, '')) || 0;
    if (prev <= 0) return 0;
    return ((next - prev) / prev) * 100;
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
    const monthly = annual / 12;
    const monthlySalary = monthly.toFixed(2);
    setSalarySaving(true);
    setBanner(null);
    setBannerErr(null);
    try {
      await client.request(PayrollSetEmployeeCompensationDocument, {
        input: {
          employeeId,
          monthlySalary,
          effectiveFrom: salaryEffective.slice(0, 10),
          changeReason: salaryReason.trim() || undefined,
        },
      });
      setSalaryOpen(false);
      setBanner('Compensation updated.');
      onChanged?.();
    } catch (e) {
      setBannerErr(e instanceof Error ? e.message : 'Salary update failed');
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
      if (managerChoice === '__CLEAR__') input.reportingManagerId = null;
      else if (managerChoice !== '__NOCHANGE__') input.reportingManagerId = managerChoice;

      await client.request(UpdateEmployeeDocument, { input });
      setRoleOpen(false);
      setBanner('Role and reporting updated.');
      onChanged?.();
    } catch (e) {
      setBannerErr(e instanceof Error ? e.message : 'Role update failed');
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
      {orgLoading ? (
        <p className="text-xs text-slate-500">Loading org directory…</p>
      ) : null}

      <InfoCard title="Employment status" subtitle="HR actions — impacts payroll and access">
        <div className="flex flex-wrap items-center gap-3">
          <EmploymentStatusBadge status={statusUi} />
          {statusUi !== 'ACTIVE' ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={statusSaving}
              onClick={() => void patchEmployeeStatus('ACTIVE')}
            >
              Activate
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={statusSaving}
            onClick={() => void patchEmployeeStatus('ON_LEAVE')}
          >
            Mark on leave
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={statusSaving}
            onClick={() => void patchEmployeeStatus('SUSPENDED')}
          >
            Suspend
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={statusSaving}
            onClick={() => setTerminateOpen(true)}
          >
            Terminate
          </Button>
        </div>
      </InfoCard>

      <InfoCard
        title="Compensation"
        subtitle={`Last updated ${formatCompactDate(model.compensation.lastUpdatedAt)}`}
        action={
          <Button type="button" size="sm" variant="primary" onClick={() => setSalaryOpen(true)}>
            Update salary
          </Button>
        }
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
              {model.compensation.components.map((c) => (
                <li key={c.code} className="flex justify-between gap-2">
                  <span>{c.label}</span>
                  <span className="tabular-nums">{formatInrAnnual(c.amountAnnual, true)}</span>
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
        action={
          <Button type="button" size="sm" variant="outline" onClick={() => setRoleOpen(true)}>
            Change
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/50">
            <p className="text-[11px] font-semibold uppercase text-slate-400">Designation</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {model.roleAssignment.designation}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/50">
            <p className="text-[11px] font-semibold uppercase text-slate-400">Department</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {model.roleAssignment.department}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/50">
            <p className="text-[11px] font-semibold uppercase text-slate-400">Manager</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {model.roleAssignment.reportingManagerName}
            </p>
          </div>
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
          {(
            [
              ['Leave policy', model.companyAssignment.leavePolicyName],
              ['Shift', model.companyAssignment.shiftName],
              ['Location', model.companyAssignment.locationName],
              ['Grade / band', model.companyAssignment.gradeBand],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
              <p className="text-[11px] font-semibold uppercase text-slate-400">{k}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{v}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <ConfirmationModal
        isOpen={terminateOpen}
        onClose={() => setTerminateOpen(false)}
        title="Terminate employment"
        warning="This action impacts payroll and access. Ensure offboarding tasks are coordinated."
        confirmLabel="Confirm termination"
        onConfirm={() => void patchEmployeeStatus('TERMINATED')}
      >
        <div className="space-y-3">
          <div className="flex gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
            <p className="text-sm">
              Record-only fields below; wire effective date to payroll when the API supports it.
            </p>
          </div>
          <Input
            label="Effective date"
            type="date"
            value={termEffective}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTermEffective(e.target.value)}
            fullWidth
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              rows={3}
              value={termReason}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTermReason(e.target.value)}
            />
          </div>
        </div>
      </ConfirmationModal>

      <Modal isOpen={salaryOpen} onClose={() => setSalaryOpen(false)} title="Update salary" size="md">
        <div className="space-y-3">
          <Input
            label="New annual base"
            value={newSalaryAnnual}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSalaryAnnual(e.target.value)}
            fullWidth
          />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Implied change: {pctHike >= 0 ? '+' : ''}
            {pctHike.toFixed(2)}%
          </p>
          <Input
            label="Effective date"
            type="date"
            value={salaryEffective}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSalaryEffective(e.target.value)}
            fullWidth
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              rows={2}
              value={salaryReason}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSalaryReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setSalaryOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={salarySaving}
              onClick={() => void saveSalary()}
            >
              {salarySaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={roleOpen} onClose={() => setRoleOpen(false)} title="Update role & org" size="md">
        <div className="space-y-3">
          <Select
            label="Department"
            value={departmentId}
            fullWidth
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setDepartmentId(e.target.value)}
            options={[
              { value: '', label: '— Keep unchanged —' },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
          <Select
            label="Designation"
            value={designationId}
            fullWidth
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setDesignationId(e.target.value)}
            options={[
              { value: '', label: '— Keep unchanged —' },
              ...designations.map((d) => ({
                value: d.id,
                label: d.title,
              })),
            ]}
          />
          <Select
            label="Reporting manager"
            value={managerChoice}
            fullWidth
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setManagerChoice(e.target.value)}
            options={[
              { value: '__NOCHANGE__', label: '— No change —' },
              { value: '__CLEAR__', label: '— No manager —' },
              ...managerOptions,
            ]}
          />
          <Input
            label="Effective date (record only)"
            type="date"
            value={roleEffective}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRoleEffective(e.target.value)}
            fullWidth
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={roleSaving}
              onClick={() => void saveRole()}
            >
              {roleSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Company assignments"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Assignment entities are not exposed on this mutation yet. Use workforce admin screens when available.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
