import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import TabBar from '../../components/common/TabBar';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  OnboardingChecklistDocument,
  SetOnboardingItemDocument,
  SeparationsListDocument,
  SubmitSeparationReqDocument,
  ApproveSeparationDocument,
  RejectSeparationDocument,
  type OnboardingChecklistQuery,
  type SeparationsListQuery,
} from '../../api/graphql/graphql';

type Item = OnboardingChecklistQuery['onboardingChecklist'][number];
type SeparationRow = SeparationsListQuery['separations'][number];

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

  const loadChecklist = useCallback(async () => {
    const r = await client.request(OnboardingChecklistDocument, { limit: 100 });
    return r.onboardingChecklist;
  }, [client]);

  const loadSep = useCallback(async () => {
    const r = await client.request(SeparationsListDocument, { limit: 50 });
    return r.separations;
  }, [client]);

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
      await client.request(SetOnboardingItemDocument, { checklistItemId: id, isCompleted: next });
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

  const submitExit = async () => {
    if (!lastDay.trim()) {
      setError('Last working day is required');
      return;
    }
    setSubmitBusy(true);
    setError(null);
    try {
      await client.request(SubmitSeparationReqDocument, {
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
        description="Complete joining tasks; submit a structured exit request when you leave, with optional HR review for pending requests."
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
