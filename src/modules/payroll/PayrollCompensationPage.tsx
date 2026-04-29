import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  ClientOpsAdminEmployeesDocument,
  PayrollEmploymentHistoryDocument,
  PayrollSetEmployeeCompensationDocument,
  type ClientOpsAdminEmployeesQuery,
  type PayrollEmploymentHistoryQuery,
  type PayrollSetEmployeeCompensationMutation,
} from '../../api/graphql/graphql';

type EmployeeRow = ClientOpsAdminEmployeesQuery['employees'][number];
type EmploymentHistoryLine = PayrollEmploymentHistoryQuery['employmentHistoryRecords'][number];

/** GraphQL NaiveDate / DateTime scalars arrive as strings at runtime. */
function displayDateOnly(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'string') return v.length >= 10 ? v.slice(0, 10) : v;
  return String(v);
}

const defaultEffectiveFrom = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
};

const PayrollCompensationPage = () => {
  const client = useGraphClient('client');
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [history, setHistory] = useState<EmploymentHistoryLine[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState<string | null>(null);
  const [monthlySalary, setMonthlySalary] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(defaultEffectiveFrom);
  const [changeReason, setChangeReason] = useState('');
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const loadEmployees = useCallback(async () => {
    setEmpLoading(true);
    setEmpError(null);
    try {
      const result = await client.request<ClientOpsAdminEmployeesQuery>(ClientOpsAdminEmployeesDocument, {
        limit: 200,
      });
      setEmployees(result.employees ?? []);
    } catch (e) {
      setEmpError(e instanceof Error ? e.message : 'Failed to load employees');
    } finally {
      setEmpLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const loadHistory = useCallback(
    async (employeeId: string) => {
      if (!employeeId) {
        setHistory([]);
        return;
      }
      setHistLoading(true);
      setHistError(null);
      try {
        const result = await client.request<PayrollEmploymentHistoryQuery>(PayrollEmploymentHistoryDocument, {
          employeeId,
          limit: 48,
        });
        setHistory(result.employmentHistoryRecords ?? []);
      } catch (e) {
        setHistory([]);
        setHistError(e instanceof Error ? e.message : 'Failed to load compensation history');
      } finally {
        setHistLoading(false);
      }
    },
    [client],
  );

  useEffect(() => {
    if (!selectedId) {
      setHistory([]);
      return;
    }
    void loadHistory(selectedId);
  }, [selectedId, loadHistory]);

  const selectedJoinDate = useMemo(() => {
    const e = employees.find((x) => x.id === selectedId);
    return e?.dateOfJoining != null ? displayDateOnly(e.dateOfJoining) : null;
  }, [employees, selectedId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId.trim()) {
      setSaveError('Select an employee');
      return;
    }
    setSaveBusy(true);
    setSaveError(null);
    setSaveOk(null);
    try {
      await client.request<PayrollSetEmployeeCompensationMutation>(PayrollSetEmployeeCompensationDocument, {
        input: {
          employeeId: selectedId,
          monthlySalary: monthlySalary.trim(),
          effectiveFrom,
          changeReason: changeReason.trim() || null,
        },
      });
      setSaveOk('Compensation saved.');
      setMonthlySalary('');
      setChangeReason('');
      void loadHistory(selectedId);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaveBusy(false);
    }
  };

  const historyColumns = useMemo(
    () => [
      {
        key: 'effectiveFrom',
        label: 'Effective from',
        render: (row: EmploymentHistoryLine) => displayDateOnly(row.effectiveFrom),
      },
      {
        key: 'monthlySalary',
        label: 'Monthly salary',
        render: (row: EmploymentHistoryLine) => row.monthlySalary ?? '—',
      },
      { key: 'changeReason', label: 'Reason', render: (row: EmploymentHistoryLine) => row.changeReason ?? '—' },
      {
        key: 'updatedAt',
        label: 'Updated',
        render: (row: EmploymentHistoryLine) => displayDateOnly(row.updatedAt),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Compensation</h1>
        <p className="mt-1 text-sm text-slate-600">
          Set monthly salary per employee. Payroll uses the latest row by <code className="text-xs">effectiveFrom</code>{' '}
          as the gross base.
        </p>
      </div>

      <Card title="Employee & history">
        {empError && <p className="mb-3 text-sm text-red-600">{empError}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="payroll-comp-emp">
              Employee
            </label>
            <select
              id="payroll-comp-emp"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              value={selectedId}
              onChange={(ev) => {
                setSelectedId(ev.target.value);
                setSaveOk(null);
                setSaveError(null);
                const j = employees.find((x) => x.id === ev.target.value)?.dateOfJoining?.slice(0, 10);
                if (j) setEffectiveFrom(j);
                else setEffectiveFrom(defaultEffectiveFrom());
              }}
              disabled={empLoading}
            >
              <option value="">{empLoading ? 'Loading…' : 'Select employee'}</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.employeeCode} — {e.fullName} ({e.status})
                </option>
              ))}
            </select>
            {selectedJoinDate && (
              <p className="mt-1 text-xs text-slate-500">Date of joining: {selectedJoinDate}</p>
            )}
          </div>
        </div>

        {selectedId && (
          <div className="mt-6">
            {histError && <p className="mb-2 text-sm text-red-600">{histError}</p>}
            {histLoading ? (
              <p className="text-sm text-slate-500">Loading history…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500">No compensation rows yet.</p>
            ) : (
              <Table data={history} columns={historyColumns} keyExtractor={(row) => row.id} />
            )}
          </div>
        )}
      </Card>

      <Card title="Set monthly salary">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="payroll-comp-amt">
                Monthly salary (gross base)
              </label>
              <input
                id="payroll-comp-amt"
                type="text"
                inputMode="decimal"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g. 65000 or 65000.00"
                value={monthlySalary}
                onChange={(ev) => setMonthlySalary(ev.target.value)}
                disabled={!selectedId}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="payroll-comp-eff">
                Effective from
              </label>
              <input
                id="payroll-comp-eff"
                type="date"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={effectiveFrom}
                onChange={(ev) => setEffectiveFrom(ev.target.value)}
                disabled={!selectedId}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="payroll-comp-reason">
              Change reason (optional)
            </label>
            <input
              id="payroll-comp-reason"
              type="text"
              className="w-full max-w-xl rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={changeReason}
              onChange={(ev) => setChangeReason(ev.target.value)}
              disabled={!selectedId}
            />
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          {saveOk && <p className="text-sm text-emerald-700">{saveOk}</p>}
          <Button type="submit" disabled={!selectedId || saveBusy}>
            {saveBusy ? 'Saving…' : 'Save compensation'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PayrollCompensationPage;
