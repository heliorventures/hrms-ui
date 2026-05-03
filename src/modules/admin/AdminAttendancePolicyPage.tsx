import { FormEvent, useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  ClientOpsAdminAttendancePolicyDocument,
  ClientOpsUpsertAttendancePunchPolicyDocument,
} from '../../api/graphql/graphql';

const AdminAttendancePolicyPage = () => {
  const client = useGraphClient('client');
  const [policy, setPolicy] = useState<{
    id?: string | null;
    isEnforced: boolean;
    siteLatitude?: number | null;
    siteLongitude?: number | null;
    maxDistanceMeters?: number | null;
    ipAllowlist?: string | null;
    updatedAt?: string | null;
  } | null>(null);
  const [shifts, setShifts] = useState<
    {
      id: string;
      name: string;
      startTime?: string | null;
      endTime?: string | null;
      workHours?: number | null;
      isNightShift: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isEnforced, setIsEnforced] = useState(false);
  const [siteLatitude, setSiteLatitude] = useState('');
  const [siteLongitude, setSiteLongitude] = useState('');
  const [maxDistanceMeters, setMaxDistanceMeters] = useState('');
  const [ipAllowlist, setIpAllowlist] = useState('');

  const load = useCallback(async () => {
    return client.request<{
      attendancePunchPolicy: {
        id?: string | null;
        isEnforced: boolean;
        siteLatitude?: number | null;
        siteLongitude?: number | null;
        maxDistanceMeters?: number | null;
        ipAllowlist?: string | null;
        updatedAt?: string | null;
      };
      shifts: typeof shifts;
    }>(ClientOpsAdminAttendancePolicyDocument, { slim: 50 });
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (c) return;
        setPolicy(r.attendancePunchPolicy);
        setShifts(r.shifts);
        const p = r.attendancePunchPolicy;
        setIsEnforced(p.isEnforced);
        setSiteLatitude(p.siteLatitude != null ? String(p.siteLatitude) : '');
        setSiteLongitude(p.siteLongitude != null ? String(p.siteLongitude) : '');
        setMaxDistanceMeters(p.maxDistanceMeters != null ? String(p.maxDistanceMeters) : '');
        setIpAllowlist(p.ipAllowlist ?? '');
      } catch (e) {
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load policy');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const lat = siteLatitude.trim() === '' ? null : Number.parseFloat(siteLatitude);
    const lng = siteLongitude.trim() === '' ? null : Number.parseFloat(siteLongitude);
    const maxM = maxDistanceMeters.trim() === '' ? null : Number.parseInt(maxDistanceMeters, 10);
    if (lat != null && Number.isNaN(lat)) {
      setFormError('Invalid latitude');
      return;
    }
    if (lng != null && Number.isNaN(lng)) {
      setFormError('Invalid longitude');
      return;
    }
    if (maxM != null && Number.isNaN(maxM)) {
      setFormError('Invalid max distance');
      return;
    }
    setSaving(true);
    try {
      await client.request(ClientOpsUpsertAttendancePunchPolicyDocument, {
        input: {
          isEnforced,
          siteLatitude: lat,
          siteLongitude: lng,
          maxDistanceMeters: maxM,
          ipAllowlist: ipAllowlist.trim() || null,
        },
      });
      const r = await load();
      if (r.attendancePunchPolicy) setPolicy(r.attendancePunchPolicy);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance punch policy</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Requires HR / tenant admin JWT claims (`attendance:punch_policy` or admin roles). Shift
        templates are read-only here.
      </p>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Live punch policy">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <form onSubmit={(e) => void onSave(e)} className="space-y-4">
            {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
            <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
              <input
                type="checkbox"
                checked={isEnforced}
                onChange={(e) => setIsEnforced(e.target.checked)}
              />
              Enforce geofence / IP rules for punch
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Site latitude"
                value={siteLatitude}
                onChange={(e) => setSiteLatitude(e.target.value)}
                fullWidth
                inputMode="decimal"
              />
              <Input
                label="Site longitude"
                value={siteLongitude}
                onChange={(e) => setSiteLongitude(e.target.value)}
                fullWidth
                inputMode="decimal"
              />
            </div>
            <Input
              label="Max distance (meters)"
              value={maxDistanceMeters}
              onChange={(e) => setMaxDistanceMeters(e.target.value)}
              fullWidth
              inputMode="numeric"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                IP allowlist (comma-separated or CIDR)
              </label>
              <textarea
                value={ipAllowlist}
                onChange={(e) => setIpAllowlist(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            {policy?.updatedAt && (
              <p className="text-xs text-gray-500">Last updated: {policy.updatedAt}</p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save policy'}
            </Button>
          </form>
        )}
      </Card>
      <Card title="Shifts">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : shifts.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {shifts.map((s) => (
              <li key={s.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{s.name}</p>
                <p className="text-xs text-gray-500">
                  {s.startTime ?? '—'} – {s.endTime ?? '—'}
                  {s.workHours != null ? ` · ${s.workHours}h` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No shift templates.</p>
        )}
      </Card>
    </div>
  );
};

export default AdminAttendancePolicyPage;
