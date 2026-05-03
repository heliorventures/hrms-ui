import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmployeeSearchSelect from '../../components/common/EmployeeSearchSelect';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useDialogs } from '../../contexts/DialogContext';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  AdminLeaveConsoleDocument,
  AdjustLeaveBalanceEntitlementAdminDocument,
  DeleteHolidayCalendarAdminDocument,
  DeleteHolidayDayAdminDocument,
  DeleteLeavePolicyAdminDocument,
  DeleteLeaveTypeAdminDocument,
  HolidaysInCalendarDocument,
  ProvisionLeaveBalancesFromPoliciesDocument,
  UpsertHolidayCalendarAdminDocument,
  UpsertHolidayDayAdminDocument,
  UpsertLeaveBalanceAdminDocument,
  UpsertLeavePolicyAdminDocument,
  UpsertLeaveTypeAdminDocument,
  type AdminLeaveConsoleQuery,
  type HolidaysInCalendarQuery,
} from '../../api/graphql/graphql';

type TabKey = 'types' | 'policies' | 'balances' | 'holidays';

const selectFieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white';

const ACCRUAL_FREQUENCY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
];

const HOLIDAY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Not specified' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'NATIONAL', label: 'National' },
  { value: 'REGIONAL', label: 'Regional' },
  { value: 'OPTIONAL', label: 'Optional' },
  { value: 'COMPANY', label: 'Company' },
];

const AdminLeaveSettingsPage = () => {
  const client = useGraphClient('client');
  const { confirm, alert } = useDialogs();
  const cy = useMemo(() => new Date().getFullYear(), []);
  const [tab, setTab] = useState<TabKey>('types');
  const [data, setData] = useState<AdminLeaveConsoleQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provisionBusy, setProvisionBusy] = useState(false);
  const [provisionYear, setProvisionYear] = useState(cy);

  const load = useCallback(async () => {
    const res = await client.request<AdminLeaveConsoleQuery>(AdminLeaveConsoleDocument, {
      calendarYear: cy,
    });
    return res;
  }, [client, cy]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (!c) setData(r);
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const refresh = async () => {
    try {
      setLoading(true);
      setData(await load());
      setError(null);
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const runProvisionFromPolicies = async () => {
    const ok = await confirm({
      title: 'Provision balances from policies?',
      message: `This upserts leave balances for every active employee for calendar year ${provisionYear} using each leave type’s policy. Existing used and pending values are kept where possible.`,
      confirmLabel: 'Provision',
    });
    if (!ok) return;
    try {
      setProvisionBusy(true);
      setError(null);
      const r = await client.request<{ provisionLeaveBalancesFromPolicies: number }>(
        ProvisionLeaveBalancesFromPoliciesDocument,
        {
          year: provisionYear,
        }
      );
      const n = r.provisionLeaveBalancesFromPolicies;
      await alert({
        title: 'Provisioning complete',
        message: `Updated ${n} employee / leave-type balance row(s).`,
        variant: 'success',
      });
      await refresh();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setProvisionBusy(false);
    }
  };

  /* --- Leave types --- */
  const [typeModal, setTypeModal] = useState(false);
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [tf, setTf] = useState({
    name: '',
    code: '',
    isPaid: true,
    carryForward: false,
    maxCf: '',
    sandwich: false,
    halfDay: true,
    reqDoc: false,
  });

  const openNewType = () => {
    setEditTypeId(null);
    setTf({
      name: '',
      code: '',
      isPaid: true,
      carryForward: false,
      maxCf: '',
      sandwich: false,
      halfDay: true,
      reqDoc: false,
    });
    setTypeModal(true);
  };

  const openEditType = (row: AdminLeaveConsoleQuery['leaveTypes'][number]) => {
    setEditTypeId(row.id);
    setTf({
      name: row.name,
      code: row.code,
      isPaid: row.isPaid,
      carryForward: row.carryForward,
      maxCf: row.maxCarryForwardDays != null ? String(row.maxCarryForwardDays) : '',
      sandwich: row.sandwichRule,
      halfDay: row.halfDayAllowed,
      reqDoc: row.requiresDocument,
    });
    setTypeModal(true);
  };

  const saveType = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await client.request(UpsertLeaveTypeAdminDocument, {
        input: {
          id: editTypeId,
          name: tf.name.trim(),
          code: tf.code.trim(),
          isPaid: tf.isPaid,
          carryForward: tf.carryForward,
          maxCarryForwardDays: tf.maxCf.trim() ? Number(tf.maxCf) : null,
          sandwichRule: tf.sandwich,
          halfDayAllowed: tf.halfDay,
          requiresDocument: tf.reqDoc,
        },
      });
      setTypeModal(false);
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const deleteType = async (id: string) => {
    const ok = await confirm({
      title: 'Delete leave type?',
      message: 'This will soft-delete the leave type for your tenant.',
      variant: 'danger',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteLeaveTypeAdminDocument, { leaveTypeId: id });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  /* --- Policies --- */
  const [polModal, setPolModal] = useState(false);
  const [editPolId, setEditPolId] = useState<string | null>(null);
  const [pf, setPf] = useState({
    leaveTypeId: '',
    applicableTo: '',
    annual: '',
    freq: '',
    accrualDays: '',
    maxCons: '',
    minNotice: '',
  });

  const openNewPol = () => {
    setEditPolId(null);
    setPf({
      leaveTypeId: data?.leaveTypes[0]?.id ?? '',
      applicableTo: '',
      annual: '',
      freq: '',
      accrualDays: '',
      maxCons: '',
      minNotice: '',
    });
    setPolModal(true);
  };

  const openEditPol = (row: AdminLeaveConsoleQuery['leavePolicies'][number]) => {
    setEditPolId(row.id);
    setPf({
      leaveTypeId: row.leaveTypeId,
      applicableTo: row.applicableTo ?? '',
      annual: row.annualEntitlement != null ? String(row.annualEntitlement) : '',
      freq: row.accrualFrequency ?? '',
      accrualDays: row.accrualDays ?? '',
      maxCons: row.maxConsecutiveDays != null ? String(row.maxConsecutiveDays) : '',
      minNotice: row.minNoticeDays != null ? String(row.minNoticeDays) : '',
    });
    setPolModal(true);
  };

  const savePol = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await client.request(UpsertLeavePolicyAdminDocument, {
        input: {
          id: editPolId,
          leaveTypeId: pf.leaveTypeId,
          applicableTo: pf.applicableTo.trim() || null,
          annualEntitlement: pf.annual.trim() ? Number(pf.annual) : null,
          accrualFrequency: pf.freq.trim() || null,
          accrualDays: pf.accrualDays.trim() || null,
          maxConsecutiveDays: pf.maxCons.trim() ? Number(pf.maxCons) : null,
          minNoticeDays: pf.minNotice.trim() ? Number(pf.minNotice) : null,
        },
      });
      setPolModal(false);
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const deletePol = async (id: string) => {
    const ok = await confirm({
      title: 'Delete policy?',
      message: 'Remove this leave policy row?',
      variant: 'danger',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteLeavePolicyAdminDocument, { leavePolicyId: id });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  /* --- Balances --- */
  const [bf, setBf] = useState({
    employeeId: '',
    leaveTypeId: '',
    year: String(cy),
    entitled: '0',
    used: '0',
    pending: '0',
    carried: '0',
  });
  const [af, setAf] = useState({
    employeeId: '',
    leaveTypeId: '',
    year: String(cy),
    delta: '1',
    alsoCredit: true,
  });

  const saveBalance = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await client.request(UpsertLeaveBalanceAdminDocument, {
        input: {
          employeeId: bf.employeeId.trim(),
          leaveTypeId: bf.leaveTypeId,
          year: Number(bf.year),
          entitledDays: bf.entitled,
          usedDays: bf.used,
          pendingDays: bf.pending,
          carriedForwardDays: bf.carried,
        },
      });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const adjustBalance = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await client.request(AdjustLeaveBalanceEntitlementAdminDocument, {
        input: {
          employeeId: af.employeeId.trim(),
          leaveTypeId: af.leaveTypeId,
          year: Number(af.year),
          entitledDelta: af.delta,
          alsoCreditBalance: af.alsoCredit,
        },
      });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  /* --- Holidays --- */
  const [calModal, setCalModal] = useState(false);
  const [holModal, setHolModal] = useState(false);
  const [cf, setCf] = useState({ name: '', year: String(cy), locationId: '' });
  const [hf, setHf] = useState({ holidayDate: '', name: '', holidayType: '' });
  const [selCal, setSelCal] = useState<string | null>(null);
  const [holDays, setHolDays] = useState<HolidaysInCalendarQuery['holidaysInCalendar']>([]);
  const [holLoading, setHolLoading] = useState(false);

  useEffect(() => {
    if (!selCal) {
      setHolDays([]);
      return;
    }
    let c = false;
    (async () => {
      try {
        setHolLoading(true);
        const r = await client.request<HolidaysInCalendarQuery>(HolidaysInCalendarDocument, {
          calendarId: selCal,
          limit: 200,
        });
        if (!c) {
          setError(null);
          setHolDays(r.holidaysInCalendar);
        }
      } catch (err) {
        if (!c) {
          setHolDays([]);
          setError(graphQlUserMessage(err));
        }
      } finally {
        if (!c) setHolLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [client, selCal]);

  const saveCalendar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await client.request(UpsertHolidayCalendarAdminDocument, {
        input: {
          id: null,
          name: cf.name.trim(),
          year: Number(cf.year),
          locationId: cf.locationId.trim() || null,
        },
      });
      setCalModal(false);
      setCf({ name: '', year: String(cy), locationId: '' });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const deleteCalendar = async (id: string) => {
    const ok = await confirm({
      title: 'Delete calendar?',
      message: 'This deletes the holiday calendar and all holidays on it.',
      variant: 'danger',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteHolidayCalendarAdminDocument, { calendarId: id });
      if (selCal === id) setSelCal(null);
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const saveHoliday = async (e: FormEvent) => {
    e.preventDefault();
    if (!selCal) return;
    try {
      setError(null);
      await client.request(UpsertHolidayDayAdminDocument, {
        input: {
          calendarId: selCal,
          id: null,
          holidayDate: hf.holidayDate,
          name: hf.name.trim(),
          holidayType: hf.holidayType.trim() || null,
        },
      });
      setHolModal(false);
      setHf({ holidayDate: '', name: '', holidayType: '' });
      const r = await client.request<HolidaysInCalendarQuery>(HolidaysInCalendarDocument, {
        calendarId: selCal,
        limit: 200,
      });
      setHolDays(r.holidaysInCalendar);
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const deleteHolidayRow = async (hid: string) => {
    const ok = await confirm({
      title: 'Remove holiday?',
      message: 'Remove this holiday from the calendar?',
      variant: 'danger',
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteHolidayDayAdminDocument, { holidayId: hid });
      if (selCal) {
        const r = await client.request<HolidaysInCalendarQuery>(HolidaysInCalendarDocument, {
          calendarId: selCal,
          limit: 200,
        });
        setHolDays(r.holidaysInCalendar);
      }
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const tabs: { k: TabKey; label: string }[] = [
    { k: 'types', label: 'Leave types' },
    { k: 'policies', label: 'Policies' },
    { k: 'balances', label: 'Balances' },
    { k: 'holidays', label: 'Holidays' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave configuration</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage master leave types, per-type policies (annual or monthly accrual), employee balances, and public holiday
            calendars. HR opens <span className="font-mono text-xs">/hr/leave-settings</span>; tenant admins also use{' '}
            <span className="font-mono text-xs">/admin/leave-settings</span>. Requires{' '}
            <span className="font-mono text-xs">leave:manage</span> or HR / tenant admin role.
          </p>
        </div>
        <Button variant="outline" type="button" onClick={() => void refresh()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.k}
            type="button"
            variant={tab === t.k ? 'primary' : 'outline'}
            className="!py-1.5 !text-sm"
            onClick={() => setTab(t.k)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {tab === 'types' && (
        <Card title="Leave types">
          <div className="mb-4">
            <Button type="button" variant="primary" className="!text-sm" onClick={openNewType}>
              Add leave type
            </Button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : data?.leaveTypes?.length ? (
            <Table
              data={data.leaveTypes}
              keyExtractor={(r) => r.id}
              columns={[
                { key: 'code', label: 'Code', render: (r) => r.code },
                { key: 'name', label: 'Name', render: (r) => r.name },
                {
                  key: 'flags',
                  label: 'Flags',
                  render: (r) => (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {r.isPaid ? 'Paid' : 'Unpaid'} · {r.halfDayAllowed ? '½ day' : 'Full'} ·{' '}
                      {r.requiresDocument ? 'Doc' : 'No doc'}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  label: '',
                  render: (r) => (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="!py-1 !text-xs"
                        onClick={() => openEditType(r)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="!py-1 !text-xs"
                        onClick={() => void deleteType(r.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <p className="text-sm text-gray-500">No leave types.</p>
          )}

          {typeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editTypeId ? 'Edit leave type' : 'New leave type'}
                </h3>
                <form className="mt-4 space-y-3" onSubmit={(e) => void saveType(e)}>
                  <Input label="Name" value={tf.name} onChange={(e) => setTf({ ...tf, name: e.target.value })} fullWidth required />
                  <Input label="Code" value={tf.code} onChange={(e) => setTf({ ...tf, code: e.target.value })} fullWidth required />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={tf.isPaid} onChange={(e) => setTf({ ...tf, isPaid: e.target.checked })} />
                    Paid leave
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={tf.carryForward} onChange={(e) => setTf({ ...tf, carryForward: e.target.checked })} />
                    Carry forward
                  </label>
                  <Input label="Max carry-forward days" value={tf.maxCf} onChange={(e) => setTf({ ...tf, maxCf: e.target.value })} fullWidth />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={tf.sandwich} onChange={(e) => setTf({ ...tf, sandwich: e.target.checked })} />
                    Sandwich rule (calendar-day span incl. weekends between dates)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={tf.halfDay} onChange={(e) => setTf({ ...tf, halfDay: e.target.checked })} />
                    Half-day allowed
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={tf.reqDoc} onChange={(e) => setTf({ ...tf, reqDoc: e.target.checked })} />
                    Requires document reference on apply
                  </label>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" variant="primary">
                      Save
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setTypeModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === 'policies' && (
        <Card title="Leave policies">
          <div className="mb-4">
            <Button type="button" variant="primary" className="!text-sm" onClick={openNewPol}>
              Add policy
            </Button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : data?.leavePolicies?.length ? (
            <Table
              data={data.leavePolicies}
              keyExtractor={(r) => r.id}
              columns={[
                {
                  key: 'lt',
                  label: 'Leave type',
                  render: (r) => data.leaveTypes.find((t) => t.id === r.leaveTypeId)?.code ?? r.leaveTypeId.slice(0, 8),
                },
                {
                  key: 'freq',
                  label: 'Accrual',
                  render: (r) =>
                    [r.accrualFrequency, r.accrualDays].every((x) => x == null || x === '')
                      ? '—'
                      : `${r.accrualFrequency ?? '—'} · ${r.accrualDays ?? '—'} d`,
                },
                {
                  key: 'ent',
                  label: 'Annual',
                  render: (r) => r.annualEntitlement ?? '—',
                },
                {
                  key: 'mx',
                  label: 'Max consec.',
                  render: (r) => r.maxConsecutiveDays ?? '—',
                },
                {
                  key: 'act',
                  label: '',
                  render: (r) => (
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="!py-1 !text-xs" onClick={() => openEditPol(r)}>
                        Edit
                      </Button>
                      <Button type="button" variant="outline" className="!py-1 !text-xs" onClick={() => void deletePol(r.id)}>
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <p className="text-sm text-gray-500">No policies.</p>
          )}

          {polModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="text-lg font-semibold">{editPolId ? 'Edit policy' : 'New policy'}</h3>
                <form className="mt-4 space-y-3" onSubmit={(e) => void savePol(e)}>
                  <label className="block text-sm font-medium">Leave type</label>
                  <select
                    className={selectFieldClass}
                    value={pf.leaveTypeId}
                    onChange={(e) => setPf({ ...pf, leaveTypeId: e.target.value })}
                    required
                  >
                    {data?.leaveTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                  <Input label="Applicable to (optional)" value={pf.applicableTo} onChange={(e) => setPf({ ...pf, applicableTo: e.target.value })} fullWidth />
                  <Input label="Annual entitlement (days)" value={pf.annual} onChange={(e) => setPf({ ...pf, annual: e.target.value })} fullWidth />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Accrual frequency
                  </label>
                  <select
                    className={selectFieldClass}
                    value={pf.freq}
                    onChange={(e) => setPf({ ...pf, freq: e.target.value })}
                  >
                    {ACCRUAL_FREQUENCY_OPTIONS.map((o) => (
                      <option key={o.value || 'none'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    For “days per month”, choose <span className="font-mono">Monthly</span> and enter monthly days below
                    (server multiplies ×12 when provisioning balances).
                  </p>
                  <Input label="Accrual days (decimal string)" value={pf.accrualDays} onChange={(e) => setPf({ ...pf, accrualDays: e.target.value })} fullWidth />
                  <Input label="Max consecutive days" value={pf.maxCons} onChange={(e) => setPf({ ...pf, maxCons: e.target.value })} fullWidth />
                  <Input label="Min notice days" value={pf.minNotice} onChange={(e) => setPf({ ...pf, minNotice: e.target.value })} fullWidth />
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" variant="primary">
                      Save
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setPolModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === 'balances' && (
        <div className="space-y-6">
          <Card title="Provision from policies (company-wide)">
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              Creates or updates <span className="font-mono">leave_balance</span> rows for every active employee using each
              leave type&apos;s policy: <strong>annual entitlement</strong> when set, otherwise{' '}
              <strong>MONTHLY</strong> accrual days × 12. Existing used / pending / carried-forward values are kept;
              entitled and available balance are recomputed.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Year</span>
                <input
                  type="number"
                  value={provisionYear}
                  onChange={(e) => setProvisionYear(Number(e.target.value))}
                  className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </label>
              <Button type="button" variant="primary" disabled={provisionBusy || loading} onClick={() => void runProvisionFromPolicies()}>
                {provisionBusy ? 'Provisioning…' : 'Provision / refresh all'}
              </Button>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Upsert balance row">
            <p className="mb-3 text-xs text-gray-500">
              Sets entitled / used / pending / carried-forward; server recomputes{' '}
              <span className="font-mono">balance_days</span> = entitled + carried − used − pending.
            </p>
            <form className="space-y-3" onSubmit={(e) => void saveBalance(e)}>
              <EmployeeSearchSelect
                employees={data?.employees ?? []}
                valueId={bf.employeeId}
                onChangeId={(id) => setBf({ ...bf, employeeId: id })}
                required
                disabled={loading}
              />
              <label className="block text-sm font-medium">Leave type</label>
              <select
                className={selectFieldClass}
                value={bf.leaveTypeId}
                onChange={(e) => setBf({ ...bf, leaveTypeId: e.target.value })}
                required
              >
                <option value="">Select…</option>
                {data?.leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code}
                  </option>
                ))}
              </select>
              <Input label="Year" value={bf.year} onChange={(e) => setBf({ ...bf, year: e.target.value })} fullWidth required />
              <Input label="Entitled days" value={bf.entitled} onChange={(e) => setBf({ ...bf, entitled: e.target.value })} fullWidth required />
              <Input label="Used days" value={bf.used} onChange={(e) => setBf({ ...bf, used: e.target.value })} fullWidth required />
              <Input label="Pending days" value={bf.pending} onChange={(e) => setBf({ ...bf, pending: e.target.value })} fullWidth required />
              <Input label="Carried forward" value={bf.carried} onChange={(e) => setBf({ ...bf, carried: e.target.value })} fullWidth required />
              <Button type="submit" variant="primary">
                Save balance
              </Button>
            </form>
          </Card>
          <Card title="Adjust entitlement">
            <p className="mb-3 text-xs text-gray-500">
              Adds days to an existing balance row. Optionally credits <span className="font-mono">balance_days</span>{' '}
              by the same delta (simple grant).
            </p>
            <form className="space-y-3" onSubmit={(e) => void adjustBalance(e)}>
              <EmployeeSearchSelect
                employees={data?.employees ?? []}
                valueId={af.employeeId}
                onChangeId={(id) => setAf({ ...af, employeeId: id })}
                required
                disabled={loading}
              />
              <label className="block text-sm font-medium">Leave type</label>
              <select
                className={selectFieldClass}
                value={af.leaveTypeId}
                onChange={(e) => setAf({ ...af, leaveTypeId: e.target.value })}
                required
              >
                <option value="">Select…</option>
                {data?.leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code}
                  </option>
                ))}
              </select>
              <Input label="Year" value={af.year} onChange={(e) => setAf({ ...af, year: e.target.value })} fullWidth required />
              <Input label="Entitled delta (+/− decimal)" value={af.delta} onChange={(e) => setAf({ ...af, delta: e.target.value })} fullWidth required />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={af.alsoCredit} onChange={(e) => setAf({ ...af, alsoCredit: e.target.checked })} />
                Also add delta to available balance
              </label>
              <Button type="submit" variant="primary">
                Apply adjustment
              </Button>
            </form>
          </Card>
        </div>
        </div>
      )}

      {tab === 'holidays' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Calendars">
            <div className="mb-3 flex gap-2">
              <Button type="button" variant="primary" className="!text-sm" onClick={() => setCalModal(true)}>
                New calendar
              </Button>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data?.holidayCalendars?.map((c) => (
                  <li
                    key={c.id}
                    className={`flex cursor-pointer items-center justify-between rounded border px-3 py-2 dark:border-gray-700 ${
                      selCal === c.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' : ''
                    }`}
                    onClick={() => setSelCal(c.id)}
                  >
                    <span>
                      {c.name} <span className="text-gray-500">({c.year})</span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      className="!py-0.5 !text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteCalendar(c.id);
                      }}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={selCal ? 'Holidays in calendar' : 'Select a calendar'}>
            {selCal ? (
              <>
                <div className="mb-3">
                  <Button type="button" variant="primary" className="!text-sm" onClick={() => setHolModal(true)}>
                    Add holiday
                  </Button>
                </div>
                {holLoading ? (
                  <p className="text-sm text-gray-500">Loading holidays…</p>
                ) : holDays.length ? (
                  <Table
                    data={holDays}
                    keyExtractor={(r) => r.id}
                    columns={[
                      {
                        key: 'd',
                        label: 'Date',
                        render: (r) => new Date(r.holidayDate).toLocaleDateString('en-IN'),
                      },
                      { key: 'n', label: 'Name', render: (r) => r.name },
                      {
                        key: 'x',
                        label: '',
                        render: (r) => (
                          <Button
                            type="button"
                            variant="outline"
                            className="!py-1 !text-xs"
                            onClick={() => void deleteHolidayRow(r.id)}
                          >
                            Remove
                          </Button>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No holidays in this calendar.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Choose a calendar on the left.</p>
            )}
          </Card>

          {calModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="text-lg font-semibold">New holiday calendar</h3>
                <form className="mt-4 space-y-3" onSubmit={(e) => void saveCalendar(e)}>
                  <Input label="Name" value={cf.name} onChange={(e) => setCf({ ...cf, name: e.target.value })} fullWidth required />
                  <Input label="Year" value={cf.year} onChange={(e) => setCf({ ...cf, year: e.target.value })} fullWidth required />
                  <Input label="Location id (optional UUID)" value={cf.locationId} onChange={(e) => setCf({ ...cf, locationId: e.target.value })} fullWidth />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary">
                      Create
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setCalModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {holModal && selCal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="text-lg font-semibold">Add holiday</h3>
                <form className="mt-4 space-y-3" onSubmit={(e) => void saveHoliday(e)}>
                  <Input type="date" label="Date" value={hf.holidayDate} onChange={(e) => setHf({ ...hf, holidayDate: e.target.value })} fullWidth required />
                  <Input label="Name" value={hf.name} onChange={(e) => setHf({ ...hf, name: e.target.value })} fullWidth required />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Holiday type</label>
                  <select
                    className={selectFieldClass}
                    value={hf.holidayType}
                    onChange={(e) => setHf({ ...hf, holidayType: e.target.value })}
                  >
                    {HOLIDAY_TYPE_OPTIONS.map((o) => (
                      <option key={o.value || 'unspecified'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary">
                      Save
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setHolModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminLeaveSettingsPage;
