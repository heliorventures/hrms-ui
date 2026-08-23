import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  MarkAllNotificationsReadDocument,
  MarkNotificationReadDocument,
  NotificationBoardSummaryDocument,
  OrgDepartmentsDocument,
  type NotificationBoardSummaryQuery,
  type OrgDepartmentsQuery,
} from '../../api/graphql/graphql';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import type { NotificationFilter } from './notificationTypes';

const NOTIFICATION_BOARD_LIMIT = 20;
const DEPARTMENT_LOOKUP_LIMIT = 100;

export const useNotificationBoard = () => {
  const client = useGraphClient('client');
  const clientRef = useRef(client);
  clientRef.current = client;
  const [deptNameById, setDeptNameById] = useState<Map<string, string>>(new Map());
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const actionBusyRef = useRef(false);
  const actionRequestIdRef = useRef(0);
  const departmentRequestIdRef = useRef(0);

  const loadBoard = useCallback(async () => {
    return client.request<NotificationBoardSummaryQuery>(NotificationBoardSummaryDocument, {
      limit: NOTIFICATION_BOARD_LIMIT,
    });
  }, [client]);

  const {
    data,
    error: boardError,
    phase,
    refresh,
  } = useRetainedQuery<NotificationBoardSummaryQuery>(loadBoard);

  const refreshBoard = useCallback(async () => {
    setActionError(null);
    await refresh();
  }, [refresh]);

  useEffect(() => {
    const requestId = ++departmentRequestIdRef.current;
    setDeptNameById(new Map());
    void (async () => {
      try {
        const response = await client.request<OrgDepartmentsQuery>(OrgDepartmentsDocument, {
          limit: DEPARTMENT_LOOKUP_LIMIT,
        });
        if (requestId !== departmentRequestIdRef.current) return;
        setDeptNameById(new Map(response.departments.map((item) => [item.id, item.name])));
      } catch {
        if (requestId === departmentRequestIdRef.current) setDeptNameById(new Map());
      }
    })();
    return () => {
      departmentRequestIdRef.current += 1;
    };
  }, [client]);

  useEffect(() => {
    actionRequestIdRef.current += 1;
    actionBusyRef.current = false;
    setActionBusy(false);
    setActionError(null);
  }, [client]);

  const filteredNotifications = useMemo(
    () =>
      filter === 'unread'
        ? (data?.notifications.filter((notification) => !notification.isRead) ?? [])
        : (data?.notifications ?? []),
    [data, filter]
  );

  const runAction = useCallback(
    async (request: () => Promise<unknown>) => {
      if (actionBusyRef.current) return;

      const requestClient = client;
      const requestId = ++actionRequestIdRef.current;
      actionBusyRef.current = true;
      setActionBusy(true);
      setActionError(null);
      try {
        await request();
        if (requestId !== actionRequestIdRef.current || clientRef.current !== requestClient) return;
        await refreshBoard();
      } catch (err) {
        if (requestId === actionRequestIdRef.current && clientRef.current === requestClient) {
          setActionError(graphQlUserMessage(err));
        }
      } finally {
        if (requestId === actionRequestIdRef.current && clientRef.current === requestClient) {
          actionBusyRef.current = false;
          setActionBusy(false);
        }
      }
    },
    [client, refreshBoard]
  );

  const markAllRead = useCallback(
    () => runAction(() => client.request(MarkAllNotificationsReadDocument)),
    [client, runAction]
  );

  const markRead = useCallback(
    (id: string) => runAction(() => client.request(MarkNotificationReadDocument, { id })),
    [client, runAction]
  );

  const hasLoadedData = data !== null;
  const loading = phase === 'initial-loading' || phase === 'refreshing';

  return {
    actionBusy,
    announcements: data?.announcements ?? [],
    announcementsMayBeCapped:
      hasLoadedData && data.announcements.length === NOTIFICATION_BOARD_LIMIT,
    deptNameById,
    error: actionError ?? boardError,
    filter,
    filteredNotifications,
    hasLoadedData,
    loading,
    markAllRead,
    markRead,
    notificationsMayBeCapped:
      hasLoadedData && data.notifications.length === NOTIFICATION_BOARD_LIMIT,
    phase,
    refreshBoard,
    setFilter,
  };
};
