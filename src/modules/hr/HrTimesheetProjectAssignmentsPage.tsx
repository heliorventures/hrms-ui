import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  EmployeeTimesheetProjectCodesDocument,
  OrgChartDocument,
  SetEmployeeTimesheetProjectsDocument,
  TimesheetProjectsDocument,
  type OrgChartQuery,
} from '../../api/graphql/graphql';

const HrTimesheetProjectAssignmentsPage = () => {
  const client = useGraphClient('client');
  const [orgRows, setOrgRows] = useState<NonNullable<OrgChartQuery['orgChart']>>([]);
  const [catalog, setCatalog] = useState<{ code: string; name: string }[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reloadBase = useCallback(async () => {
    const [orgR, catR] = await Promise.all([
      client.request<OrgChartQuery>(OrgChartDocument, { limit: 500 }),
      client.request(TimesheetProjectsDocument, { limit: 200 }),
    ]);
    setOrgRows(orgR.orgChart ?? []);
    setCatalog(catR.timesheetProjects ?? []);
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await reloadBase();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadBase]);

  useEffect(() => {
    if (!employeeId.trim()) {
      setSelected(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingCodes(true);
        const r = await client.request(EmployeeTimesheetProjectCodesDocument, {
          employeeId: employeeId.trim(),
        });
        const codes = r.employeeTimesheetProjectCodes ?? [];
        if (!cancelled) setSelected(new Set(codes.map((c) => c.trim().toUpperCase()).filter(Boolean)));
      } catch (e) {
        if (!cancelled) {
          setSelected(new Set());
          setError(e instanceof Error ? e.message : 'Could not load assignments');
        }
      } finally {
        if (!cancelled) setLoadingCodes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, employeeId]);

  const employeeOptions = useMemo(() => {
    const rows = [...(orgRows ?? [])].sort((a, b) =>
      (a.fullName ?? '').localeCompare(b.fullName ?? '', undefined, { sensitivity: 'base' })
    );
    return [
      { value: '', label: loading ? 'Loading…' : '— Select employee —' },
      ...rows.map((r) => ({
        value: r.employeeId,
        label: `${r.fullName}${r.employeeCode ? ` (${r.employeeCode})` : ''}`,
      })),
    ];
  }, [orgRows, loading]);

  const toggleCode = (code: string) => {
    const u = code.trim().toUpperCase();
    if (!u) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      return next;
    });
    setMessage(null);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await client.request(SetEmployeeTimesheetProjectsDocument, {
        employeeId: employeeId.trim(),
        projectCodes: [...selected].sort((a, b) => a.localeCompare(b)),
      });
      setMessage('Saved. Empty selection means all catalog projects are allowed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const unrestricted = employeeId.trim().length > 0 && selected.size === 0 && !loadingCodes;

  return (
    <div className="space-y-6">
      <Card title="Timesheet project assignments">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Restrict which projects an employee can log hours against. Leave none selected and save to allow{' '}
          <strong>all</strong> active catalog projects.
        </p>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <form className="space-y-4" onSubmit={(ev) => void save(ev)}>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-700 dark:text-green-400">{message}</p>}

            <Select
              label="Employee"
              value={employeeId}
              onChange={(ev) => {
                setEmployeeId(ev.target.value);
                setMessage(null);
                setError(null);
              }}
              options={employeeOptions}
              fullWidth
            />

            {employeeId.trim() ? (
              <>
                {loadingCodes ? (
                  <p className="text-sm text-gray-500">Loading current assignments…</p>
                ) : (
                  <>
                    {unrestricted && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Currently <strong>unrestricted</strong> — this employee may use any active project.
                      </p>
                    )}
                    <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      {catalog.length === 0 ? (
                        <p className="text-sm text-gray-500">No projects in catalog — add them under Admin → Timesheet settings.</p>
                      ) : (
                        catalog.map((p) => {
                          const u = p.code.trim().toUpperCase();
                          const checked = selected.has(u);
                          return (
                            <label
                              key={p.code}
                              className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleCode(p.code)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
                              />
                              <span>
                                {p.code} — {p.name}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
                <Button type="submit" variant="primary" disabled={saving || loadingCodes}>
                  {saving ? 'Saving…' : 'Save assignments'}
                </Button>
              </>
            ) : null}
          </form>
        )}
      </Card>
    </div>
  );
};

export default HrTimesheetProjectAssignmentsPage;
