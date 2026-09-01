import { useCallback, useEffect, useRef, useState } from 'react';

import {
  LeaveWorkflowTrailQueryDocument,
  type LeaveBoardQuery,
  type LeaveWorkflowTrailQueryQuery,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

type LeaveRequest = LeaveBoardQuery['leaveRequests'][number];
type WorkflowRows = LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail'];

const EMPTY_WORKFLOW_ROWS: WorkflowRows = [];

export interface LeaveWorkflowTrailClient {
  request<T>(
    document: typeof LeaveWorkflowTrailQueryDocument,
    variables: { leaveRequestId: string }
  ): Promise<T>;
}

export interface LeaveWorkflowTrailFailure {
  message: string;
  operation: 'workflowTrail';
  request: LeaveRequest;
}

export const useLeaveWorkflowTrail = (client: LeaveWorkflowTrailClient) => {
  const [summaryRow, setSummaryRow] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<WorkflowRows>(EMPTY_WORKFLOW_ROWS);
  const [failure, setFailure] = useState<LeaveWorkflowTrailFailure | null>(null);
  const [publishedOwner, setPublishedOwner] = useState(client);
  const mountedRef = useRef(false);
  const ownerRef = useRef(client);
  const requestGenerationRef = useRef(0);
  const selectedRequestIdRef = useRef<string | null>(null);

  ownerRef.current = client;

  useEffect(() => {
    mountedRef.current = true;
    requestGenerationRef.current += 1;
    selectedRequestIdRef.current = null;
    setPublishedOwner(client);
    setSummaryRow(null);
    setRows(EMPTY_WORKFLOW_ROWS);
    setFailure(null);
    setLoading(false);

    return () => {
      mountedRef.current = false;
      requestGenerationRef.current += 1;
      selectedRequestIdRef.current = null;
    };
  }, [client]);

  const open = useCallback(
    async (request: LeaveRequest) => {
      const owner = client;
      const generation = requestGenerationRef.current + 1;
      requestGenerationRef.current = generation;
      selectedRequestIdRef.current = request.id;
      setPublishedOwner(owner);
      setSummaryRow(request);
      setLoading(true);
      setRows(EMPTY_WORKFLOW_ROWS);
      setFailure(null);
      try {
        const response = await client.request<LeaveWorkflowTrailQueryQuery>(
          LeaveWorkflowTrailQueryDocument,
          { leaveRequestId: request.id }
        );
        if (
          mountedRef.current &&
          ownerRef.current === owner &&
          requestGenerationRef.current === generation &&
          selectedRequestIdRef.current === request.id
        ) {
          setRows(response.leaveRequestWorkflowTrail);
        }
      } catch (error) {
        if (
          mountedRef.current &&
          ownerRef.current === owner &&
          requestGenerationRef.current === generation &&
          selectedRequestIdRef.current === request.id
        ) {
          setFailure({
            message: graphQlUserMessage(error),
            operation: 'workflowTrail',
            request,
          });
          setSummaryRow(null);
        }
      } finally {
        if (
          mountedRef.current &&
          ownerRef.current === owner &&
          requestGenerationRef.current === generation &&
          selectedRequestIdRef.current === request.id
        ) {
          setLoading(false);
        }
      }
    },
    [client]
  );

  const ownsPublishedState = publishedOwner === client;
  const visibleFailure = ownsPublishedState ? failure : null;

  const retry = useCallback(async () => {
    if (visibleFailure) await open(visibleFailure.request);
  }, [open, visibleFailure]);

  const close = useCallback(() => {
    requestGenerationRef.current += 1;
    selectedRequestIdRef.current = null;
    setPublishedOwner(client);
    setSummaryRow(null);
    setRows(EMPTY_WORKFLOW_ROWS);
    setLoading(false);
  }, [client]);

  const clearFailure = useCallback(() => setFailure(null), []);

  return {
    clearFailure,
    close,
    failure: visibleFailure,
    loading: ownsPublishedState ? loading : false,
    open,
    retry,
    rows: ownsPublishedState ? rows : EMPTY_WORKFLOW_ROWS,
    summaryRow: ownsPublishedState ? summaryRow : null,
  };
};
