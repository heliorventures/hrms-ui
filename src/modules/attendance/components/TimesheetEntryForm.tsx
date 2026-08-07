import { FormEvent, useEffect, useMemo, useState } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  CreateTimesheetEntryDocument,
  TimesheetProjectsForEmployeeDocument,
  TimesheetTaskTypesDocument,
  UpdateTimesheetEntryDocument,
} from '../../../api/graphql/graphql';
import { clampIsoDateToRange } from '../../../utils/timesheetWeek';
import { encodeTimesheetDescription, decodeTimesheetDescription } from '../../../utils/timesheetDescription';

export interface TimesheetEntryFormProps {
  onClose: () => void;
  onSaved: () => void;
  /** Inclusive bounds for work date (YYYY-MM-DD). */
  allowedMinIso: string;
  allowedMaxIso: string;
  /** Initial date inside range when adding a row. */
  initialWorkDateIso?: string;
  /** Edit existing row (omit for create). */
  editing?: {
    id: string;
    workDate: string;
    hoursWorked: string;
    projectCode?: string | null;
    description?: string | null;
  };
}

function localTodayIso(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const d = String(n.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const TimesheetEntryForm = ({
  onClose,
  onSaved,
  allowedMinIso,
  allowedMaxIso,
  initialWorkDateIso,
  editing,
}: TimesheetEntryFormProps) => {
  const client = useGraphClient('client');
  const defaultWorkDate = clampIsoDateToRange(
    initialWorkDateIso ?? localTodayIso(),
    allowedMinIso,
    allowedMaxIso
  );
  const [workDate, setWorkDate] = useState(editing?.workDate ?? defaultWorkDate);
  const [hoursWorked, setHoursWorked] = useState(editing?.hoursWorked ?? '8');
  const [projectCode, setProjectCode] = useState(editing?.projectCode?.trim() ?? '');
  const decoded = decodeTimesheetDescription(editing?.description ?? null);
  const [taskCode, setTaskCode] = useState(decoded.task);
  const [notes, setNotes] = useState(decoded.notes);
  const [projects, setProjects] = useState<{ code: string; name: string }[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setWorkDate((prev) => clampIsoDateToRange(prev, allowedMinIso, allowedMaxIso));
  }, [allowedMinIso, allowedMaxIso]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCatalog(true);
        const r = await client.request(TimesheetProjectsForEmployeeDocument, { limit: 100 });
        const rows = r.timesheetProjectsForEmployee ?? [];
        if (!cancelled) setProjects(rows);
      } catch {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    const pc = projectCode.trim();
    if (!pc) {
      setTasks([]);
      return;
    }
    (async () => {
      try {
        const r = await client.request(TimesheetTaskTypesDocument, { projectCode: pc });
        if (!cancelled) setTasks(r.timesheetTaskTypes ?? []);
      } catch {
        if (!cancelled) setTasks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectCode]);

  const projectOptions = useMemo(() => {
    const opts = projects.map((p) => ({ value: p.code, label: `${p.code} — ${p.name}` }));
    return [{ value: '', label: loadingCatalog ? 'Loading projects…' : '— Optional —' }, ...opts];
  }, [projects, loadingCatalog]);

  const taskOptions = useMemo(() => {
    const opts = tasks.map((t) => ({ value: t, label: t }));
    return [{ value: '', label: tasks.length ? '— Task —' : 'No tasks (configure in admin)' }, ...opts];
  }, [tasks]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const wd = clampIsoDateToRange(workDate, allowedMinIso, allowedMaxIso);
    const desc = encodeTimesheetDescription(taskCode, notes);
    try {
      if (editing) {
        await client.request(UpdateTimesheetEntryDocument, {
          input: {
            id: editing.id,
            workDate: wd,
            hoursWorked,
            projectCode: projectCode.trim() || null,
            description: desc,
          },
        });
      } else {
        await client.request(CreateTimesheetEntryDocument, {
          input: {
            workDate: wd,
            hoursWorked,
            projectCode: projectCode.trim() || null,
            description: desc,
          },
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title={editing ? 'Edit timesheet entry' : 'Add timesheet entry'}>
      <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-4">
        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

        <Input
          type="date"
          label="Work date"
          value={workDate}
          min={allowedMinIso}
          max={allowedMaxIso}
          onChange={(e) => setWorkDate(e.target.value)}
          fullWidth
          required
        />

        <Input
          label="Hours"
          value={hoursWorked}
          onChange={(e) => setHoursWorked(e.target.value)}
          fullWidth
          required
          inputMode="decimal"
        />

        <Select
          label="Project"
          value={projectCode}
          onChange={(e) => setProjectCode(e.target.value)}
          options={projectOptions}
          fullWidth
        />

        <Select
          label="Task type"
          value={taskCode}
          onChange={(e) => setTaskCode(e.target.value)}
          options={taskOptions}
          fullWidth
          disabled={!projectCode.trim()}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Optional detail"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Submit entry'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TimesheetEntryForm;
