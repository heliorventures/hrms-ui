import { ClientError } from 'graphql-request';
import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';

import {
  PreviewAttendanceDayPolicyDocument,
  ScheduleAttendanceDayPolicyDocument,
  type AttendancePolicySettingsQuery,
  type PreviewAttendanceDayPolicyQuery,
} from '../../api/attendance/graphql';
import { useGraphClient } from '../../hooks/useGraphClient';
import { boundaryTime } from '../../utils/attendanceDay';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

export type AttendanceDayPolicy = AttendancePolicySettingsQuery['attendanceDayPolicy'];
type Preview = PreviewAttendanceDayPolicyQuery['previewAttendanceDayPolicy'];

export interface AttendanceDayPolicyDraftOptions {
  ownerKey: string;
  policy: AttendanceDayPolicy;
  onPolicyChanged: (policy: AttendanceDayPolicy) => void;
  reloadPolicy: () => Promise<void>;
}

interface PolicyProposalInput {
  boundaryTime: string;
  effectiveWorkDate: string;
  expectedRevision: number;
}

interface PolicyProposal {
  input: PolicyProposalInput;
  preview: Preview;
}

function useRequestOwnership(client: object, ownerKey: string) {
  const mounted = useRef(false);
  const ownerGeneration = useRef(0);
  const previewGeneration = useRef(0);
  const scheduleGeneration = useRef(0);
  useLayoutEffect(() => {
    mounted.current = true;
    ownerGeneration.current += 1;
    previewGeneration.current += 1;
    scheduleGeneration.current += 1;
    return () => {
      mounted.current = false;
      ownerGeneration.current += 1;
      previewGeneration.current += 1;
      scheduleGeneration.current += 1;
    };
  }, [client, ownerKey]);
  return {
    ownerGeneration,
    ownsRequest: (generation: number) => mounted.current && ownerGeneration.current === generation,
    previewGeneration,
    scheduleGeneration,
  };
}

const conflictMessage = async (reloadPolicy: () => Promise<void>) => {
  try {
    await reloadPolicy();
    return 'The attendance day policy changed while you were reviewing it. The latest policy was reloaded; preview your retained draft again.';
  } catch {
    return 'The attendance day policy changed while you were reviewing it. Your draft was retained, but the latest policy could not be reloaded. Reload the page before previewing again.';
  }
};

function proposalIsConfirmed(
  proposal: PolicyProposal | null,
  confirmed: boolean,
  busy: 'preview' | 'schedule' | null
): proposal is PolicyProposal {
  return proposal !== null && confirmed && busy === null;
}

function isConflict(error: unknown) {
  if (error instanceof ClientError) {
    return error.response.errors?.some(
      ({ extensions }) => String(extensions.code).toUpperCase() === 'CONFLICT'
    );
  }
  return Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    String((error as { code?: unknown }).code).toUpperCase() === 'CONFLICT'
  );
}

export function useAttendanceDayPolicyDraft({
  ownerKey,
  policy,
  onPolicyChanged,
  reloadPolicy,
}: AttendanceDayPolicyDraftOptions) {
  const client = useGraphClient('client');
  const [boundary, setBoundary] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [proposal, setProposal] = useState<PolicyProposal | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState<'preview' | 'schedule' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const policyRef = useRef(policy);
  policyRef.current = policy;
  const { ownerGeneration, ownsRequest, previewGeneration, scheduleGeneration } =
    useRequestOwnership(client, ownerKey);

  useLayoutEffect(() => {
    const currentPolicy = policyRef.current;
    const draft = currentPolicy.pendingPolicy ?? currentPolicy.currentPolicy;
    setBoundary(boundaryTime(draft.boundaryMinutes));
    setEffectiveDate(currentPolicy.pendingPolicy?.effectiveWorkDate ?? '');
    setProposal(null);
    setConfirmed(false);
    setBusy(null);
    setError(null);
    setSuccess(null);
  }, [client, ownerKey]);

  const changeDraft = (change: () => void) => {
    previewGeneration.current += 1;
    change();
    setProposal(null);
    setConfirmed(false);
    setError(null);
    setSuccess(null);
    setBusy((current) => (current === 'preview' ? null : current));
  };
  const requestPreview = async (event: FormEvent) => {
    event.preventDefault();
    const input: PolicyProposalInput = {
      boundaryTime: boundary,
      effectiveWorkDate: effectiveDate,
      expectedRevision: policy.revision,
    };
    const request = ++previewGeneration.current;
    const owner = ownerGeneration.current;
    setBusy('preview');
    setError(null);
    setSuccess(null);
    setConfirmed(false);
    try {
      const result = await client.request<PreviewAttendanceDayPolicyQuery>(
        PreviewAttendanceDayPolicyDocument,
        { input }
      );
      if (!ownsRequest(owner) || previewGeneration.current !== request) return;
      setProposal({ input, preview: result.previewAttendanceDayPolicy });
    } catch (reason) {
      if (!ownsRequest(owner) || previewGeneration.current !== request) return;
      setProposal(null);
      setError(graphQlUserMessage(reason));
    } finally {
      if (ownsRequest(owner) && previewGeneration.current === request) setBusy(null);
    }
  };
  const schedule = async () => {
    if (!proposalIsConfirmed(proposal, confirmed, busy)) return;
    const confirmedProposal = proposal;
    const request = ++scheduleGeneration.current;
    const owner = ownerGeneration.current;
    const ownsSchedule = () => ownsRequest(owner) && scheduleGeneration.current === request;
    setBusy('schedule');
    setError(null);
    setSuccess(null);
    try {
      const result = await client.request<{ scheduleAttendanceDayPolicy: AttendanceDayPolicy }>(
        ScheduleAttendanceDayPolicyDocument,
        { input: confirmedProposal.input }
      );
      if (!ownsSchedule()) return;
      onPolicyChanged(result.scheduleAttendanceDayPolicy);
      setProposal(null);
      setConfirmed(false);
      setSuccess('Attendance day change scheduled.');
    } catch (reason) {
      if (!ownsSchedule()) return;
      setProposal(null);
      setConfirmed(false);
      if (!isConflict(reason)) {
        setError(graphQlUserMessage(reason));
      } else {
        const message = await conflictMessage(reloadPolicy);
        if (!ownsSchedule()) return;
        setError(message);
      }
    } finally {
      if (ownsSchedule()) setBusy(null);
    }
  };
  return {
    boundary,
    busy,
    changeDraft,
    confirmed,
    effectiveDate,
    error,
    preview: proposal?.preview ?? null,
    requestPreview,
    schedule,
    setBoundary,
    setConfirmed,
    setEffectiveDate,
    success,
  };
}
