import { FormEvent, useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  ClientOpsAdminAttendancePolicyDocument,
  ClientOpsUpsertAttendancePunchPolicyDocument,
} from '../../api/graphql/graphql';

const DECIMAL_PATTERN = /^-?(?:\d+|\d+\.\d+|\.\d+)$/;

const parseOptionalDecimal = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!DECIMAL_PATTERN.test(trimmed)) return NaN;
  return Number(trimmed);
};

const isValidIpv4CidrToken = (token: string) => {
  const [ip, cidr, extra] = token.split('/');
  if (!ip || extra != null) return false;
  const octets = ip.split('.');
  if (octets.length !== 4) return false;
  const hasValidOctets = octets.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const value = Number(part);
    return value >= 0 && value <= 255;
  });
  if (!hasValidOctets) return false;
  if (cidr == null) return true;
  if (!/^\d{1,2}$/.test(cidr)) return false;
  const mask = Number(cidr);
  return mask >= 0 && mask <= 32;
};

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
        if (!c) setError(graphQlUserMessage(e));
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
    const lat = parseOptionalDecimal(siteLatitude);
    const lng = parseOptionalDecimal(siteLongitude);
    const maxM = parseOptionalDecimal(maxDistanceMeters);
    const allowlistTokens = ipAllowlist
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (lat != null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) {
      setFormError('Latitude must be a decimal value between -90 and 90.');
      return;
    }
    if (lng != null && (!Number.isFinite(lng) || lng < -180 || lng > 180)) {
      setFormError('Longitude must be a decimal value between -180 and 180.');
      return;
    }
    if (maxM != null && (!Number.isFinite(maxM) || maxM <= 0 || !Number.isInteger(maxM))) {
      setFormError('Max distance must be a whole number greater than 0 meters.');
      return;
    }
    if (allowlistTokens.some((token) => !isValidIpv4CidrToken(token))) {
      setFormError('IP allowlist must contain comma-separated IPv4 addresses or IPv4 CIDR ranges.');
      return;
    }
    const hasCompleteGeoRule = lat != null && lng != null && maxM != null;
    const hasPartialGeoRule = lat != null || lng != null || maxM != null;
    if (hasPartialGeoRule && !hasCompleteGeoRule) {
      setFormError('Latitude, longitude, and max distance are required together for geofence enforcement.');
      return;
    }
    if (isEnforced && !hasCompleteGeoRule && !allowlistTokens.length) {
      setFormError('Enable enforcement only after adding a complete geofence or at least one IP rule.');
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
      setFormError(graphQlUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance punch policy</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Requires the `attendance:punch_policy` permission. Shift
        templates are read-only here.
      </p>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Live Punch Policy">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
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
                label="Site Latitude"
                value={siteLatitude}
                onChange={(e) => setSiteLatitude(e.target.value)}
                fullWidth
                inputMode="decimal"
              />
              <Input
                label="Site Longitude"
                value={siteLongitude}
                onChange={(e) => setSiteLongitude(e.target.value)}
                fullWidth
                inputMode="decimal"
              />
            </div>
            <Input
              label="Max Distance (Meters)"
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
              {saving ? 'Saving...' : 'Save Policy'}
            </Button>
          </form>
        )}
      </Card>
      <Card title="Shifts">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
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
          <p className="text-sm text-gray-500">No Shift Templates.</p>
        )}
      </Card>
    </div>
  );
};

export default AdminAttendancePolicyPage;
