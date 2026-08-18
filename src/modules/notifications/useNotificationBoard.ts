import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  MarkAllNotificationsReadDocument,
  MarkNotificationReadDocument,
  OrgDepartmentsDocument,
  NotificationBoardSummaryDocument,
  type NotificationBoardSummaryQuery,
  type OrgDepartmentsQuery,
} from '../../api/graphql/graphql';
import type { NotificationBoardData, NotificationFilter } from './notificationTypes';

const NOTIFICATION_BOARD_LIMIT = 20;
const DEPARTMENT_LOOKUP_LIMIT = 100;

export const useNotificationBoard = () => {
  const client = useGraphClient('client');
  const [deptNameById, setDeptNameById] = useState<Map<string, string>>(new Map());
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [data, setData] = useState<NotificationBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const loadBoard = useCallback(async () => {
    return client.request<NotificationBoardSummaryQuery>(NotificationBoardSummaryDocument, {
      limit: NOTIFICATION_BOARD_LIMIT,
    });
  }, [client]);

  const refreshBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loadBoard());
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [loadBoard]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await client.request<OrgDepartmentsQuery>(OrgDepartmentsDocument, {
          limit: DEPARTMENT_LOOKUP_LIMIT,
        });
        if (cancelled) return;
        setDeptNameById(new Map((response.departments ?? []).map((item) => [item.id, item.name])));
      } catch {
        if (!cancelled) setDeptNameById(new Map());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void loadBoard()
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err) => {
        if (!cancelled) setError(graphQlUserMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadBoard]);

  const filteredNotifications = useMemo(
    () =>
      filter === 'unread'
        ? (data?.notifications.filter((notification) => !notification.isRead) ?? [])
        : (data?.notifications ?? []),
    [data, filter]
  );

  const markAllRead = async () => {
    setActionBusy(true);
    setError(null);
    try {
      await client.request(MarkAllNotificationsReadDocument);
      setData(await loadBoard());
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setActionBusy(false);
    }
  };

  const markRead = async (id: string) => {
    setActionBusy(true);
    setError(null);
    try {
      await client.request(MarkNotificationReadDocument, { id });
      setData(await loadBoard());
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setActionBusy(false);
    }
  };

  return {
    actionBusy,
    announcements: data?.announcements ?? [],
    deptNameById,
    error,
    filter,
    filteredNotifications,
    loading,
    markAllRead,
    markRead,
    refreshBoard,
    setFilter,
  };
};
