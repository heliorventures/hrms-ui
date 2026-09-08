import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { downloadReportCsv } from '../reports/downloadReportCsv';
import { useReportOwner } from '../reports/useReportOwner';

export const PrejoiningPipelineCsvDocument = `
  query PrejoiningPipelineCsv($status: String) { prejoiningCandidatesCsv(status: $status) }
`;

const PrejoiningPipelineExport = ({ status }: { status: string }) => {
  const client = useGraphClient('client');
  const owner = useReportOwner();
  const { clientSession } = useAuth();
  const allowed = createPermissionService(clientSession).canScopedPermission('prejoining:review', [
    'ALL',
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);
  const request = useRef<object | null>(null);
  const current = useRef({ client, owner, status, allowed });
  current.current = { client, owner, status, allowed };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    request.current = null;
    setBusy(false);
    setError(null);
  }, [client, owner, status, allowed]);
  const download = async () => {
    if (!allowed || request.current) return;
    const marker = {};
    request.current = marker;
    setBusy(true);
    setError(null);
    const owns = () =>
      alive.current &&
      request.current === marker &&
      current.current.client === client &&
      current.current.owner === owner &&
      current.current.status === status &&
      current.current.allowed;
    try {
      const result = await client.request<{ prejoiningCandidatesCsv: string }>(
        PrejoiningPipelineCsvDocument,
        { status: status || null }
      );
      if (owns()) downloadReportCsv('prejoining-candidates.csv', result.prejoiningCandidatesCsv);
    } catch (cause) {
      if (owns()) setError(graphQlUserMessage(cause));
    } finally {
      if (owns()) {
        request.current = null;
        setBusy(false);
      }
    }
  };
  if (!allowed) return null;
  return (
    <div className="space-y-1">
      <Button
        size="sm"
        variant="outline"
        busy={busy}
        busyLabel="Preparing CSV…"
        onClick={() => {
          void download();
        }}
      >
        Download CSV
      </Button>
      {error && (
        <p role="alert" className="max-w-sm text-sm text-status-danger">
          {error}
        </p>
      )}
    </div>
  );
};
export default PrejoiningPipelineExport;
