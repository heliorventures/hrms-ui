import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  EmployeeEvidenceReviewQueueDocument,
  EmployeeProfileChangeReviewDetailDocument,
  EmployeeProfileReviewQueueDocument,
  ResolveEmployeeProfileChangeDocument,
  ResolveEmployeeEducationDocument,
  ResolveEmployeeWorkExperienceDocument,
  type EmployeeEvidenceReviewQueueQuery,
  type EmployeeProfileReviewQueueQuery,
} from '../../api/graphql/graphql';
import {
  EmployeeDocumentAttachmentDocument,
  employeeDocumentObjectUrl,
  type EmployeeDocumentAttachmentResponse,
} from './employeeDocumentAttachment';
import { reviewFieldLabel, reviewValueRows } from './profile-review/profileReviewValues';

type QueueItem = EmployeeProfileReviewQueueQuery['employeeProfileReviewQueue'][number];
type EvidenceItem = EmployeeEvidenceReviewQueueQuery['employeeEvidenceReviewQueue'][number];

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const ProfileReviewPage = () => {
  const client = useGraphClient('client');
  const [status, setStatus] = useState('PENDING');
  const [rows, setRows] = useState<QueueItem[]>([]);
  const [evidenceRows, setEvidenceRows] = useState<EvidenceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof loadDetail>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [evidenceReject, setEvidenceReject] = useState<EvidenceItem | null>(null);
  const [evidenceLink, setEvidenceLink] = useState<{ documentId: string; url: string } | null>(null);

  async function loadDetail(requestId: string) {
    const result = await client.request(EmployeeProfileChangeReviewDetailDocument, { requestId });
    return result.employeeProfileChangeReviewDetail;
  }

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, evidenceResult] = await Promise.all([
        client.request(EmployeeProfileReviewQueueDocument, { status, limit: 100 }),
        client.request(EmployeeEvidenceReviewQueueDocument, { limit: 100 }),
      ]);
      setRows(result.employeeProfileReviewQueue);
      setEvidenceRows(evidenceResult.employeeEvidenceReviewQueue);
      setSelectedId((current) =>
        current && result.employeeProfileReviewQueue.some((row) => row.request.id === current)
          ? current
          : null
      );
    } catch (cause) {
      setError(graphQlUserMessage(cause));
      setRows([]);
      setEvidenceRows([]);
    } finally {
      setLoading(false);
    }
  }, [client, status]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    return () => {
      if (evidenceUrl) {
        URL.revokeObjectURL(evidenceUrl);
      }
    };
  }, [evidenceUrl]);

  useEffect(() => {
    return () => {
      if (evidenceLink?.url) {
        URL.revokeObjectURL(evidenceLink.url);
      }
    };
  }, [evidenceLink]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setEvidenceUrl(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setError(null);
    setEvidenceUrl(null);
    void loadDetail(selectedId)
      .then((value) => {
        if (!cancelled) setDetail(value);
      })
      .catch((cause) => {
        if (!cancelled) setError(graphQlUserMessage(cause));
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const valueRows = useMemo(
    () =>
      detail
        ? reviewValueRows(asRecord(detail.currentValues), asRecord(detail.requestedValues))
        : [],
    [detail]
  );

  const resolve = async (approved: boolean) => {
    if (!detail) return;
    setBusy(true);
    setError(null);
    try {
      await client.request(ResolveEmployeeProfileChangeDocument, {
        requestId: detail.request.id,
        approved,
        rejectionReason: approved ? undefined : rejectionReason.trim(),
      });
      setRejectionOpen(false);
      setRejectionReason('');
      setSelectedId(null);
      setDetail(null);
      await loadQueue();
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const loadEvidence = async () => {
    const documentId = detail?.request.supportingDocumentId;
    if (!documentId) return;
    setBusy(true);
    setError(null);
    try {
      const result = await client.request<EmployeeDocumentAttachmentResponse>(
        EmployeeDocumentAttachmentDocument,
        { employeeDocumentId: documentId }
      );
      setEvidenceUrl(employeeDocumentObjectUrl(result.employeeDocumentAttachment));
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const resolveEvidence = async (row: EvidenceItem, approved: boolean, reason?: string) => {
    setBusy(true);
    setError(null);
    try {
      if (row.evidenceType === 'EDUCATION') {
        await client.request(ResolveEmployeeEducationDocument, {
          educationId: row.recordId,
          approved,
          rejectionReason: approved ? undefined : reason,
        });
      } else {
        await client.request(ResolveEmployeeWorkExperienceDocument, {
          workExperienceId: row.recordId,
          approved,
          rejectionReason: approved ? undefined : reason,
        });
      }
      setEvidenceRows((current) => current.filter((item) => item.recordId !== row.recordId));
      setEvidenceReject(null);
      setRejectionReason('');
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const loadEvidenceDocument = async (documentId: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = await client.request<EmployeeDocumentAttachmentResponse>(
        EmployeeDocumentAttachmentDocument,
        { employeeDocumentId: documentId }
      );
      setEvidenceLink({
        documentId,
        url: employeeDocumentObjectUrl(result.employeeDocumentAttachment),
      });
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="h-6 w-6 text-indigo-600" aria-hidden /> Profile Review Queue
          </h1>
          <p className="mt-1 text-sm text-slate-500">Review sensitive employee changes and supporting evidence. Values are decrypted only after opening a request.</p>
        </div>
        <Button type="button" variant="outline" className="gap-2" disabled={loading} onClick={() => void loadQueue()}>
          <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
        </Button>
      </div>

      <Card title={`Education and work evidence (${evidenceRows.length})`}>
        {loading ? <p className="text-sm text-slate-500">Loading evidence...</p> : null}
        {!loading && evidenceRows.length === 0 ? <p className="text-sm text-slate-500">No education or work evidence is awaiting review.</p> : null}
        <div className="space-y-3">
          {evidenceRows.map((row) => {
            const firstDocumentId = row.evidenceDocumentIds[0];
            const openUrl = firstDocumentId && evidenceLink?.documentId === firstDocumentId ? evidenceLink.url : null;
            return (
              <div key={`${row.evidenceType}-${row.recordId}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div><p className="font-semibold text-slate-900 dark:text-white">{row.employeeName} · {row.evidenceType === 'EDUCATION' ? 'Education' : 'Work experience'}</p><p className="text-sm text-slate-500">{row.employeeCode} · {row.summary}</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  {firstDocumentId ? <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void loadEvidenceDocument(firstDocumentId)}>Secure evidence</Button> : null}
                  {openUrl ? <a href={openUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600">Open</a> : null}
                  <Button type="button" size="sm" variant="danger" disabled={busy} onClick={() => { setEvidenceReject(row); setRejectionReason(''); }}>Reject</Button>
                  <Button type="button" size="sm" variant="primary" disabled={busy} onClick={() => void resolveEvidence(row, true)}>Verify</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

      <div className="flex items-center gap-3">
        <label htmlFor="profile-review-status" className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
        <select id="profile-review-status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.4fr)]">
        <Card title={`${status.charAt(0)}${status.slice(1).toLowerCase()} requests (${rows.length})`}>
          {loading ? <p className="text-sm text-slate-500">Loading requests...</p> : null}
          {!loading && rows.length === 0 ? <p className="text-sm text-slate-500">No requests in this queue.</p> : null}
          <div className="space-y-2">
            {rows.map((row) => (
              <button key={row.request.id} type="button" onClick={() => setSelectedId(row.request.id)} className={`w-full rounded-xl border p-3 text-left transition ${selectedId === row.request.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-slate-200 hover:border-indigo-300 dark:border-slate-700'}`}>
                <p className="font-semibold text-slate-900 dark:text-white">{row.employeeName}</p>
                <p className="text-xs text-slate-500">{row.employeeCode} · {row.request.requestedSummary}</p>
                <p className="mt-1 text-xs text-slate-400">Submitted {new Date(row.request.createdAt).toLocaleString('en-IN')}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card title={detail ? `${detail.employeeName} · ${detail.request.requestType.split('_').join(' ')}` : 'Review details'}>
          {!selectedId ? <p className="text-sm text-slate-500">Select a request to load its protected details.</p> : null}
          {detailLoading ? <p className="text-sm text-slate-500">Decrypting protected values...</p> : null}
          {detail && !detailLoading ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr><th className="p-3">Field</th><th className="p-3">Current</th><th className="p-3">Requested</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {valueRows.map((row) => <tr key={row.key}><th className="p-3 font-medium">{reviewFieldLabel(row.key)}</th><td className="p-3 font-mono text-xs">{row.current}</td><td className="p-3 font-mono text-xs font-semibold">{row.requested}</td></tr>)}
                  </tbody>
                </table>
              </div>
              {detail.request.supportingDocumentId ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" disabled={busy} onClick={() => void loadEvidence()}>Open secure evidence</Button>
                  {evidenceUrl ? <a href={evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">Open evidence <ExternalLink className="h-4 w-4" aria-hidden /></a> : null}
                </div>
              ) : <p className="text-sm text-amber-700">No supporting document was attached.</p>}
              {detail.request.status === 'PENDING' ? (
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="danger" disabled={busy} onClick={() => setRejectionOpen(true)}>Reject</Button>
                  <Button type="button" variant="primary" disabled={busy} onClick={() => void resolve(true)}>{busy ? 'Saving...' : 'Approve'}</Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>

      <Modal isOpen={rejectionOpen} onClose={() => !busy && setRejectionOpen(false)} title="Reject profile change">
        <div className="space-y-4">
          <label htmlFor="profile-rejection-reason" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Reason shown to the employee</label>
          <textarea id="profile-rejection-reason" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={4} maxLength={1000} className="w-full rounded-lg border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setRejectionOpen(false)}>Cancel</Button><Button type="button" variant="danger" disabled={busy || !rejectionReason.trim()} onClick={() => void resolve(false)}>{busy ? 'Saving...' : 'Confirm rejection'}</Button></div>
        </div>
      </Modal>
      <Modal isOpen={evidenceReject !== null} onClose={() => !busy && setEvidenceReject(null)} title="Reject profile evidence">
        <div className="space-y-4">
          <label htmlFor="evidence-rejection-reason" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Reason shown to the employee</label>
          <textarea id="evidence-rejection-reason" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={4} maxLength={1000} className="w-full rounded-lg border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setEvidenceReject(null)}>Cancel</Button><Button type="button" variant="danger" disabled={busy || !rejectionReason.trim()} onClick={() => evidenceReject && void resolveEvidence(evidenceReject, false, rejectionReason.trim())}>{busy ? 'Saving...' : 'Confirm rejection'}</Button></div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileReviewPage;
