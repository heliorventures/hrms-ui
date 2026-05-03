import { FormEvent, useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  AttendanceAdjustmentPolicyDocument,
  TimesheetLockPolicyDocument,
  TimesheetProjectsDocument,
  TimesheetTaskTypesDocument,
  UpsertAttendanceAdjustmentPolicyHrDocument,
  UpsertTimesheetLockPolicyHrDocument,
  UpsertTimesheetProjectHrDocument,
  UpsertTimesheetTaskTypesHrDocument,
} from '../../api/graphql/graphql';

const AdminHrTimesheetSettingsPage = () => {
  const { can } = useAuth();
  const client = useGraphClient('client');
  const canManageCatalog = can('timesheet:manage');
  const canPolicyWide = can('timesheet:manage') || can('attendance:punch_policy');

  const [maxSelfDays, setMaxSelfDays] = useState('14');
  const [editableWeekSpan, setEditableWeekSpan] = useState('4');
  const [lockApproved, setLockApproved] = useState(true);

  const [projectCode, setProjectCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState<{ code: string; name: string }[]>([]);
  const [taskProjectCode, setTaskProjectCode] = useState('');
  const [taskLines, setTaskLines] = useState('INTERNAL\nMEETING');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reloadPolicies = useCallback(async () => {
    try {
      const [adj, lock] = await Promise.all([
        client.request(AttendanceAdjustmentPolicyDocument),
        client.request(TimesheetLockPolicyDocument),
      ]);
      const d = adj.attendanceAdjustmentPolicy?.maxSelfAdjustDays;
      setMaxSelfDays(String(d ?? '14'));
      const span = lock.timesheetLockPolicy?.editableWeekSpan;
      setEditableWeekSpan(String(span ?? '4'));
      setLockApproved(Boolean(lock.timesheetLockPolicy?.lockApprovedEntries));
    } catch {
      /* defaults */
    }
  }, [client]);

  const reloadProjects = useCallback(async () => {
    try {
      const r = await client.request(TimesheetProjectsDocument, { limit: 100 });
      const rows = r.timesheetProjects ?? [];
      setProjects(rows);
      setTaskProjectCode((prev) => (prev.trim() ? prev : rows[0]?.code ?? ''));
    } catch {
      setProjects([]);
    }
  }, [client]);

  useEffect(() => {
    void reloadPolicies();
    void reloadProjects();
  }, [reloadPolicies, reloadProjects]);

  useEffect(() => {
    if (!taskProjectCode.trim()) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await client.request(TimesheetTaskTypesDocument, {
          projectCode: taskProjectCode.trim(),
        });
        const list = r.timesheetTaskTypes ?? [];
        if (!cancelled) setTaskLines(list.join('\n'));
      } catch {
        if (!cancelled) setTaskLines('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, taskProjectCode]);

  const saveAdjustment = async (e: FormEvent) => {
    e.preventDefault();
    if (!canPolicyWide) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await client.request(UpsertAttendanceAdjustmentPolicyHrDocument, {
        input: { maxSelfAdjustDays: parseInt(maxSelfDays, 10) || 0 },
      });
      setMessage('Attendance adjustment policy saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const saveLock = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await client.request(UpsertTimesheetLockPolicyHrDocument, {
        input: {
          editableWeekSpan: parseInt(editableWeekSpan, 10) || 1,
          lockApprovedEntries: lockApproved,
        },
      });
      setMessage('Timesheet lock policy saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const addProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await client.request(UpsertTimesheetProjectHrDocument, {
        code: projectCode.trim(),
        name: projectName.trim(),
        displayOrder: null,
      });
      setProjectCode('');
      setProjectName('');
      await reloadProjects();
      setMessage('Project saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const saveTasks = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) return;
    const codes = taskLines
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await client.request(UpsertTimesheetTaskTypesHrDocument, {
        projectCode: taskProjectCode.trim(),
        taskCodes: codes,
      });
      setMessage(`Task list saved for ${taskProjectCode.trim()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const projectPickOpts = [
    { value: '', label: 'Choose project' },
    ...projects.map((p) => ({ value: p.code, label: `${p.code} — ${p.name}` })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Timesheet & attendance rules
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tenant-wide catalogs and policies. Managers assign work using projects/tasks configured
          here (per-employee project assignment is not modeled yet).
        </p>
      </div>

      {(message || error) && (
        <Card>
          {message && <p className="text-sm text-green-700 dark:text-green-400">{message}</p>}
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </Card>
      )}

      <Card title="Attendance self-adjust window">
        <form className="space-y-3 max-w-md" onSubmit={(ev) => void saveAdjustment(ev)}>
          <Input
            label="Max calendar days employees may self-add missed punches"
            value={maxSelfDays}
            onChange={(e) => setMaxSelfDays(e.target.value)}
            inputMode="numeric"
            fullWidth
            disabled={!canPolicyWide}
          />
          <Button type="submit" variant="primary" disabled={!canPolicyWide || busy}>
            Save adjustment policy
          </Button>
          {!canPolicyWide && (
            <p className="text-xs text-gray-500">Needs HR attendance policy or timesheet manage.</p>
          )}
        </form>
      </Card>

      <Card title="Timesheet lock policy">
        <form className="space-y-3 max-w-md" onSubmit={(ev) => void saveLock(ev)}>
          <Input
            label="Editable week span (rolling Mondays HR allows drafts for)"
            value={editableWeekSpan}
            onChange={(e) => setEditableWeekSpan(e.target.value)}
            inputMode="numeric"
            fullWidth
            disabled={!canManageCatalog}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={lockApproved}
              disabled={!canManageCatalog}
              onChange={(e) => setLockApproved(e.target.checked)}
            />
            Lock approved timesheet rows from edits
          </label>
          <Button type="submit" variant="primary" disabled={!canManageCatalog || busy}>
            Save lock policy
          </Button>
          {!canManageCatalog && (
            <p className="text-xs text-gray-500">Needs timesheet:manage.</p>
          )}
        </form>
      </Card>

      <Card title="Company projects">
        <form className="grid max-w-xl gap-3 md:grid-cols-2" onSubmit={(ev) => void addProject(ev)}>
          <Input
            label="Code"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="INTERNAL"
            fullWidth
            disabled={!canManageCatalog}
          />
          <Input
            label="Display name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Internal / overhead"
            fullWidth
            disabled={!canManageCatalog}
          />
          <div className="md:col-span-2">
            <Button type="submit" variant="primary" disabled={!canManageCatalog || busy}>
              Upsert project
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Task types per project">
        <form className="space-y-3 max-w-xl" onSubmit={(ev) => void saveTasks(ev)}>
          <Select
            label="Project"
            value={taskProjectCode}
            onChange={(e) => setTaskProjectCode(e.target.value)}
            options={projectPickOpts}
            fullWidth
            disabled={!canManageCatalog}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Task codes (one per line)
            </label>
            <textarea
              value={taskLines}
              onChange={(e) => setTaskLines(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              disabled={!canManageCatalog}
            />
          </div>
          <Button type="submit" variant="primary" disabled={!canManageCatalog || busy}>
            Save task list
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminHrTimesheetSettingsPage;
