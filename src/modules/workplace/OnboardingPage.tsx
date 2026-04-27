import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import TabBar from '../../components/common/TabBar';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  OnboardingChecklistDocument,
  SetOnboardingChecklistItemDocument,
  ClientOpsSeparationsListDocument,
  ClientOpsSubmitSeparationDocument,
  ApproveSeparationDocument,
  RejectSeparationDocument,
  ClientOpsFnfBySeparationDocument,
  ClientOpsClearanceBySeparationDocument,
  ClientOpsUpsertFnfDocument,
  ClientOpsFinalizeFnfDocument,
  ClientOpsSetClearanceClearedDocument,
  ClientOpsEnsureOffboardingDocument,
  type OnboardingChecklistQuery,
  type ClientOpsSeparationsListQuery,
  type ClientOpsFnfBySeparationQuery,
  type ClientOpsClearanceBySeparationQuery,
} from '../../api/graphql/graphql';

type Item = OnboardingChecklistQuery['onboardingChecklist'][number];
type SeparationRow = ClientOpsSeparationsListQuery['separations'][number];
type FnfSettlementRow = NonNullable<ClientOpsFnfBySeparationQuery['fnfSettlement']>;
type ClearanceItemRow = ClientOpsClearanceBySeparationQuery['clearanceChecklist'][number];

type MainTab = 'join' | 'exit';

const OnboardingPage = () => {
  const { role } = useAuth();
  const client = useGraphClient('client');
  const [mainTab, setMainTab] = useState<MainTab>('join');
  const [items, setItems] = useState<Item[]>([]);
  const [seps, setSeps] = useState<SeparationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [sepType, setSepType] = useState('RESIGNATION');
  const [lastDay, setLastDay] = useState('');
  const [resignDay, setResignDay] = useState('');
  const [reason, setReason] = useState('');
  const [submitBusy, setSubmitBusy] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [openObId, setOpenObId] = useState<string | null>(null);
  const [obFnf, setObFnf] = useState<FnfSettlementRow | null>(null);
  const [obCl, setObCl] = useState<ClearanceItemRow[]>([]);
  const [obLoading, setObLoading] = useState(false);
  const [obErr, setObErr] = useState<string | null>(null);
  const [fnfForm, setFnfForm] = useState({ le: '', g: '', b: '', r: '' });
  const [fnfBusy, setFnfBusy] = useState(false);
  const [clBusy, setClBusy] = useState<string | null>(null);
  const [ensureBusy, setEnsureBusy] = useState(false);

  const loadChecklist = useCallback(async () => {
    const r = await client.request(OnboardingChecklistDocument, { limit: 100 });
    return r.onboardingChecklist;
  }, [client]);

  const loadSep = useCallback(async () => {
    const r = await client.request(ClientOpsSeparationsListDocument, { limit: 50 });
    return r.separations;
  }, [client]);

  const loadOffboardingDetail = useCallback(
    async (separationId: string) => {
      setObLoading(true);
      setObErr(null);
      try {
        const [a, c] = await Promise.all([
          client.request(ClientOpsFnfBySeparationDocument, { separationId }),
          client.request(ClientOpsClearanceBySeparationDocument, { separationId }),
        ]);
        const f = a.fnfSettlement;
        setObFnf(f ?? null);
        setObCl(c.clearanceChecklist);
        if (f) {
          setFnfForm({
            le: f.leaveEncashment ?? '',
            g: f.gratuityAmount ?? '',
            b: f.bonusPayable ?? '',
            r: f.recoveryAmount ?? '',
          });
        } else {
          setFnfForm({ le: '', g: '', b: '', r: '' });
        }
      } catch (e) {
        setObErr(e instanceof Error ? e.message : 'Failed to load offboarding data');
        setObFnf(null);
        setObCl([]);
      } finally {
        setObLoading(false);
      }
    },
    [client]
  );

  useEffect(() => {
    if (!openObId) {
      return;
    }
    void loadOffboardingDetail(openObId);
  }, [openObId, loadOffboardingDetail]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const [cl, sp] = await Promise.all([loadChecklist(), loadSep()]);
        if (!c) {
          setItems(cl);
          setSeps(sp);
        }
      } catch (e) {
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [loadChecklist, loadSep]);

  const toggle = async (id: string, next: boolean) => {
    setBusyId(id);
    try {
      await client.request(SetOnboardingChecklistItemDocument, { checklistItemId: id, isCompleted: next });
      setItems(await loadChecklist());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const hrAction = async (id: string, approve: boolean) => {
    setActionId(id);
    setError(null);
    try {
      if (approve) {
        await client.request(ApproveSeparationDocument, { separationId: id });
      } else {
        await client.request(RejectSeparationDocument, { separationId: id });
      }
      setSeps(await loadSep());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const saveFnf = async (separationId: string) => {
    setFnfBusy(true);
    setObErr(null);
    try {
      await client.request(ClientOpsUpsertFnfDocument, {
        input: {
          separationId,
          leaveEncashment: fnfForm.le.trim() || null,
          gratuityAmount: fnfForm.g.trim() || null,
          bonusPayable: fnfForm.b.trim() || null,
          recoveryAmount: fnfForm.r.trim() || null,
        },
      });
      await loadOffboardingDetail(separationId);
    } catch (e) {
      setObErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setFnfBusy(false);
    }
  };

  const finalizeFnf = async (separationId: string) => {
    if (!window.confirm('Mark this FNF as processed? Amounts can no longer be edited.')) return;
    setFnfBusy(true);
    setObErr(null);
    try {
      await client.request(ClientOpsFinalizeFnfDocument, { separationId });
      await loadOffboardingDetail(separationId);
    } catch (e) {
      setObErr(e instanceof Error ? e.message : 'Finalize failed');
    } finally {
      setFnfBusy(false);
    }
  };

  const ensureOffboardingRows = async (separationId: string) => {
    setEnsureBusy(true);
    setObErr(null);
    try {
      await client.request(ClientOpsEnsureOffboardingDocument, { separationId });
      await loadOffboardingDetail(separationId);
    } catch (e) {
      setObErr(e instanceof Error ? e.message : 'Failed to create rows');
    } finally {
      setEnsureBusy(false);
    }
  };

  const toggleClearance = async (separationId: string, clearanceId: string, next: boolean) => {
    setClBusy(clearanceId);
    setObErr(null);
    try {
      await client.request(ClientOpsSetClearanceClearedDocument, {
        clearanceId,
        isCleared: next,
      });
      await loadOffboardingDetail(separationId);
    } catch (e) {
      setObErr(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setClBusy(null);
    }
  };

  const submitExit = async () => {
    if (!lastDay.trim()) {
      setError('Last working day is required');
      return;
    }
    setSubmitBusy(true);
    setError(null);
    try {
      await client.request(ClientOpsSubmitSeparationDocument, {
        input: {
          separationType: sepType,
          lastWorkingDate: lastDay,
          resignationDate: resignDay.trim() ? resignDay : null,
          reason: reason.trim() || null,
        },
      });
      setSeps(await loadSep());
      setReason('');
      setResignDay('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding & exit"
        description="Complete joining tasks; file exit requests, HR approval, then department clearance and full and final (FNF) settlement after approval."
      />

      <TabBar
        value={mainTab}
        onChange={(id) => setMainTab(id as MainTab)}
        tabs={[
          { id: 'join', label: 'Joining checklist' },
          { id: 'exit', label: 'Exit & separation' },
        ]}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {mainTab === 'join' && (
        <Card title="Checklist">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : items.length ? (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-slate-50/40 p-3 dark:border-slate-600 dark:bg-slate-800/30"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{it.taskName}</p>
                    <p className="text-xs text-gray-500">
                      {it.taskCategory ?? 'General'}
                      {it.dueDate != null ? ` · due ${String(it.dueDate)}` : ''}
                    </p>
                  </div>
                  <Button
                    variant={it.isCompleted ? 'secondary' : 'primary'}
                    disabled={busyId === it.id}
                    onClick={() => void toggle(it.id, !it.isCompleted)}
                  >
                    {busyId === it.id ? '…' : it.isCompleted ? 'Mark incomplete' : 'Mark done'}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No onboarding tasks for your profile.</p>
          )}
        </Card>
      )}

      {mainTab === 'exit' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="New exit request">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={sepType}
                  onChange={(e) => setSepType(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80"
                >
                  <option value="RESIGNATION">Resignation</option>
                  <option value="RETIREMENT">Retirement</option>
                  <option value="END_OF_CONTRACT">End of contract</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  Last working day <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={lastDay}
                  onChange={(e) => setLastDay(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  Resignation submitted on (optional)
                </label>
                <input
                  type="date"
                  value={resignDay}
                  onChange={(e) => setResignDay(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80"
                  placeholder="Optional context for HR"
                />
              </div>
              <Button variant="primary" disabled={submitBusy} onClick={() => void submitExit()}>
                {submitBusy ? 'Submitting…' : 'Submit request'}
              </Button>
            </div>
          </Card>
          <Card title="Your requests">
            {loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : seps.length ? (
              <ul className="space-y-3">
                {seps.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-lg border border-slate-200/90 bg-slate-50/30 p-3 dark:border-slate-600 dark:bg-slate-800/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {s.separationType} ·{' '}
                          <span
                            className={
                              s.status === 'APPROVED'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : s.status === 'REJECTED'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-amber-600 dark:text-amber-400'
                            }
                          >
                            {s.status}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          LWD {String(s.lastWorkingDate)}
                          {s.resignationDate != null
                            ? ` · submitted ${String(s.resignationDate)}`
                            : ''}
                        </p>
                        {s.reason ? (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {s.reason}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {s.status === 'APPROVED' && (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setOpenObId((cur) => (cur === s.id ? null : s.id));
                            }}
                          >
                            {openObId === s.id ? 'Hide' : 'Clearance & FNF'}
                          </Button>
                        )}
                        {role === 'admin' && s.status === 'PENDING' && (
                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="primary"
                              disabled={actionId === s.id}
                              onClick={() => void hrAction(s.id, true)}
                            >
                              {actionId === s.id ? '…' : 'Approve'}
                            </Button>
                            <Button
                              variant="secondary"
                              disabled={actionId === s.id}
                              onClick={() => void hrAction(s.id, false)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {s.status === 'APPROVED' && openObId === s.id && (
                      <div className="mt-3 border-t border-slate-200/90 pt-3 dark:border-slate-600">
                        {obLoading && openObId === s.id ? (
                          <p className="text-sm text-gray-500">Loading clearance & FNF…</p>
                        ) : obErr && openObId === s.id ? (
                          <p className="text-sm text-red-600 dark:text-red-400">{obErr}</p>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Department clearance
                              </p>
                              {obCl.length === 0 && role === 'admin' && !obLoading && (
                                <p className="mb-2 text-sm text-amber-700 dark:text-amber-300">
                                  If this was approved before FNF was enabled, create rows once.
                                </p>
                              )}
                              {obCl.length === 0 && role === 'admin' && (
                                <Button
                                  variant="secondary"
                                  disabled={ensureBusy}
                                  onClick={() => void ensureOffboardingRows(s.id)}
                                >
                                  {ensureBusy ? '…' : 'Create clearance & FNF records'}
                                </Button>
                              )}
                              {obCl.length ? (
                                <ul className="space-y-2">
                                  {obCl.map((c) => (
                                    <li
                                      key={c.id}
                                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200/80 bg-white/50 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900/40"
                                    >
                                      <span>
                                        <span className="font-medium text-slate-800 dark:text-slate-100">
                                          {c.department}
                                        </span>
                                        <span className="text-slate-600 dark:text-slate-300">
                                          {' '}
                                          — {c.taskName}
                                        </span>
                                      </span>
                                      {role === 'admin' ? (
                                        <label className="flex items-center gap-2 text-xs">
                                          <input
                                            type="checkbox"
                                            checked={c.isCleared}
                                            disabled={clBusy === c.id}
                                            onChange={(e) =>
                                              void toggleClearance(s.id, c.id, e.target.checked)
                                            }
                                          />
                                          Cleared
                                        </label>
                                      ) : (
                                        <span
                                          className={
                                            c.isCleared
                                              ? 'text-xs text-emerald-600'
                                              : 'text-xs text-amber-600'
                                          }
                                        >
                                          {c.isCleared ? 'Cleared' : 'Pending'}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-slate-500">No clearance rows (re-open after sync).</p>
                              )}
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Full &amp; final (FNF)
                              </p>
                              {obFnf == null && !obLoading && role === 'admin' ? (
                                <p className="text-sm text-slate-500">
                                  No FNF row yet. Use the create button in clearance above, or records
                                  are created automatically when HR approves a pending request.
                                </p>
                              ) : null}
                              {obFnf == null && !obLoading && role !== 'admin' ? (
                                <p className="text-sm text-slate-500">
                                  HR will publish your full &amp; final details here after
                                  processing.
                                </p>
                              ) : null}
                              {obFnf ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-slate-500">
                                    Status: <strong>{obFnf.status}</strong>
                                    {obFnf.netPayable != null
                                      ? ` · Net ${obFnf.netPayable}`
                                      : ''}
                                    {obFnf.processedAt
                                      ? ` · processed ${obFnf.processedAt}`
                                      : ''}
                                  </p>
                                  {role === 'admin' && obFnf.status === 'DRAFT' && (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      {(
                                        [
                                          ['le', 'Leave encashment', 'le'],
                                          ['g', 'Gratuity', 'g'],
                                          ['b', 'Bonus payable', 'b'],
                                          ['r', 'Recovery (deduct)', 'r'],
                                        ] as const
                                      ).map(([k, label, formKey]) => (
                                        <label key={k} className="block text-xs">
                                          <span className="text-slate-500">{label}</span>
                                          <input
                                            type="text"
                                            value={fnfForm[formKey]}
                                            onChange={(e) =>
                                              setFnfForm((p) => ({
                                                ...p,
                                                [formKey]: e.target.value,
                                              }))
                                            }
                                            className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                                            placeholder="0.00"
                                          />
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                  {role === 'admin' && obFnf.status === 'DRAFT' && (
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        variant="primary"
                                        disabled={fnfBusy}
                                        onClick={() => void saveFnf(s.id)}
                                      >
                                        {fnfBusy ? '…' : 'Save amounts'}
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        disabled={fnfBusy}
                                        onClick={() => void finalizeFnf(s.id)}
                                      >
                                        Finalize FNF
                                      </Button>
                                    </div>
                                  )}
                                  {role !== 'admin' && (
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                      FNF is managed by HR. Your net payable (if any) will appear
                                      here.
                                    </p>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No separation requests yet.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
