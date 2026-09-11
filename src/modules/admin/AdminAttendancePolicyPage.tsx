import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import {
  AttendancePolicySettingsDocument,
  type AttendancePolicySettingsQuery,
} from '../../api/attendance/graphql';
import { ClientOpsUpsertAttendancePunchPolicyDocument } from '../../api/graphql/graphql';
import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import PageInformation from '../../components/common/PageInformation';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import AttendanceDayPolicySettings from './AttendanceDayPolicySettings';

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

const AuthorizedAttendancePolicyPage = ({ identity }: { identity: string }) => {
  const client = useGraphClient('client');
  const owner = useMemo(() => ({ client, identity }), [client, identity]);
  const mounted = useRef(false);
  const generation = useRef(0);
  const [loadedOwner, setLoadedOwner] = useState<typeof owner | null>(null);
  const [policy, setPolicy] = useState<{
    id?: string | null;
    isEnforced: boolean;
    siteLatitude?: number | null;
    siteLongitude?: number | null;
    maxDistanceMeters?: number | null;
    ipAllowlist?: string | null;
    updatedAt?: string | null;
  } | null>(null);
  const [dayPolicy, setDayPolicy] = useState<
    AttendancePolicySettingsQuery['attendanceDayPolicy'] | null
  >(null);
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
    void identity;
    return client.request<AttendancePolicySettingsQuery>(AttendancePolicySettingsDocument);
  }, [client, identity]);

  const ownsRequest = useCallback(
    (request: number) => mounted.current && generation.current === request,
    []
  );

  const applySettings = useCallback(
    (result: AttendancePolicySettingsQuery) => {
      setPolicy(result.attendancePunchPolicy);
      setDayPolicy(result.attendanceDayPolicy);
      setShifts(result.shifts);
      const punchPolicy = result.attendancePunchPolicy;
      setIsEnforced(punchPolicy.isEnforced);
      setSiteLatitude(punchPolicy.siteLatitude != null ? String(punchPolicy.siteLatitude) : '');
      setSiteLongitude(punchPolicy.siteLongitude != null ? String(punchPolicy.siteLongitude) : '');
      setMaxDistanceMeters(
        punchPolicy.maxDistanceMeters != null ? String(punchPolicy.maxDistanceMeters) : ''
      );
      setIpAllowlist(punchPolicy.ipAllowlist ?? '');
      setLoadedOwner(owner);
    },
    [owner]
  );

  useLayoutEffect(() => {
    mounted.current = true;
    generation.current += 1;
    setLoadedOwner(null);
    setLoading(true);
    setError(null);
    setSaving(false);
    setFormError(null);
    return () => {
      mounted.current = false;
      generation.current += 1;
    };
  }, [owner]);

  useEffect(() => {
    const request = generation.current;
    void (async () => {
      try {
        const result = await load();
        if (!ownsRequest(request)) return;
        applySettings(result);
      } catch (e) {
        if (ownsRequest(request)) setError(graphQlUserMessage(e));
      } finally {
        if (ownsRequest(request)) setLoading(false);
      }
    })();
  }, [applySettings, load, ownsRequest]);

  const reloadPolicy = useCallback(async () => {
    const request = generation.current;
    const result = await load();
    if (ownsRequest(request)) applySettings(result);
  }, [applySettings, load, ownsRequest]);

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
      setFormError(
        'Latitude, longitude, and max distance are required together for geofence enforcement.'
      );
      return;
    }
    if (isEnforced && !hasCompleteGeoRule && !allowlistTokens.length) {
      setFormError(
        'Enable enforcement only after adding a complete geofence or at least one IP rule.'
      );
      return;
    }
    const request = generation.current;
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
      if (!ownsRequest(request)) return;
      const r = await load();
      if (ownsRequest(request)) applySettings(r);
    } catch (err) {
      if (ownsRequest(request)) setFormError(graphQlUserMessage(err));
    } finally {
      if (ownsRequest(request)) setSaving(false);
    }
  };

  const ownerIsCurrent = loadedOwner === owner;

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Attendance punch policy</h1>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      {ownerIsCurrent && dayPolicy ? (
        <AttendanceDayPolicySettings
          ownerKey={identity}
          policy={dayPolicy}
          onPolicyChanged={(nextPolicy) => {
            if (loadedOwner === owner) setDayPolicy(nextPolicy);
          }}
          reloadPolicy={reloadPolicy}
        />
      ) : null}
      <Card title="Live Punch Policy">
        {loading || !ownerIsCurrent ? (
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
      <PageInformation title="Shift reference">
        <Card title="Shifts">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : ownerIsCurrent && shifts.length ? (
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
      </PageInformation>
    </div>
  );
};

const AdminAttendancePolicyPage = () => {
  const { clientSession, tenantId, user } = useAuth();
  const permissions = createPermissionService(clientSession);
  if (!permissions.canRoute('/admin/attendance-policy')) {
    return (
      <p role="status" className="text-sm text-content-secondary">
        You do not have access to manage attendance policy.
      </p>
    );
  }
  const identity = `${tenantId ?? ''}:${user?.id ?? ''}:${authorizationStateKey(clientSession)}`;
  return <AuthorizedAttendancePolicyPage key={identity} identity={identity} />;
};

export default AdminAttendancePolicyPage;
