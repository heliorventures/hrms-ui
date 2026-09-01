import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { MarkNotificationReadDocument } from '../../api/graphql/graphql';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  NotificationPreviewDocument,
  UnreadNotificationCountDocument,
} from '../../modules/notifications/notificationQueries';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

export interface BoardNotification {
  id: string;
  title?: string | null;
  message?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationCountData {
  unreadNotificationCount?: number | null;
}

interface NotificationPreviewData {
  notifications?: BoardNotification[] | null;
}

const PREVIEW_LIMIT = 15;
const REFRESH_MS = 60_000;

type NotificationClient = ReturnType<typeof useGraphClient>;

interface NotificationState {
  client: NotificationClient | null;
  notifications: BoardNotification[];
  unreadCount: number;
  countError: string | null;
  previewError: string | null;
  previewLoading: boolean;
  previewLoaded: boolean;
}

type NotificationStateSetter = Dispatch<SetStateAction<NotificationState>>;

function emptyNotificationState(client: NotificationClient | null): NotificationState {
  return {
    client,
    notifications: [],
    unreadCount: 0,
    countError: null,
    previewError: null,
    previewLoading: false,
    previewLoaded: false,
  };
}

function stateForClient(current: NotificationState, client: NotificationClient): NotificationState {
  return current.client === client ? current : emptyNotificationState(client);
}

function useMarkNotificationRead({
  client,
  clientRef,
  setState,
}: {
  client: NotificationClient;
  clientRef: MutableRefObject<NotificationClient>;
  setState: NotificationStateSetter;
}) {
  return useCallback(
    async (notification: BoardNotification) => {
      if (notification.isRead) return;
      const requestClient = client;
      try {
        await requestClient.request(MarkNotificationReadDocument, { id: notification.id });
        if (clientRef.current !== requestClient) return;
        setState((current) => {
          if (current.client !== requestClient) return current;
          return {
            ...current,
            notifications: current.notifications.map((item) =>
              item.id === notification.id ? { ...item, isRead: true } : item
            ),
            unreadCount: Math.max(0, current.unreadCount - 1),
          };
        });
      } catch {
        // Navigation remains available when read-state persistence is temporarily unavailable.
      }
    },
    [client, clientRef, setState]
  );
}

export function useNotificationDropdownData({
  isAuthenticated,
  isOpen,
}: {
  isAuthenticated: boolean;
  isOpen: boolean;
}) {
  const client = useGraphClient('client');
  const clientRef = useRef(client);
  clientRef.current = client;
  const [state, setState] = useState<NotificationState>(() => emptyNotificationState(client));
  const countRequestId = useRef(0);
  const previewRequestId = useRef(0);

  const loadCount = useCallback(
    () => client.request<NotificationCountData>(UnreadNotificationCountDocument),
    [client]
  );

  const loadPreview = useCallback(
    () =>
      client.request<NotificationPreviewData>(NotificationPreviewDocument, {
        limit: PREVIEW_LIMIT,
      }),
    [client]
  );

  const refreshCount = useCallback(async () => {
    if (!isAuthenticated) return;
    const requestClient = client;
    const requestId = ++countRequestId.current;
    try {
      const data = await loadCount();
      if (requestId !== countRequestId.current || clientRef.current !== requestClient) return;
      setState((current) => ({
        ...stateForClient(current, requestClient),
        unreadCount: data.unreadNotificationCount ?? 0,
        countError: null,
      }));
    } catch (error) {
      if (requestId !== countRequestId.current || clientRef.current !== requestClient) return;
      setState((current) => ({
        ...stateForClient(current, requestClient),
        countError: graphQlUserMessage(error),
      }));
    }
  }, [client, isAuthenticated, loadCount]);

  const refreshPreview = useCallback(async () => {
    if (!isAuthenticated) return;
    const requestClient = client;
    const requestId = ++previewRequestId.current;
    setState((current) => ({
      ...stateForClient(current, requestClient),
      previewLoading: true,
      previewError: null,
    }));
    try {
      const data = await loadPreview();
      if (requestId !== previewRequestId.current || clientRef.current !== requestClient) return;
      setState((current) => ({
        ...stateForClient(current, requestClient),
        notifications: data.notifications ?? [],
        previewLoaded: true,
      }));
    } catch (error) {
      if (requestId !== previewRequestId.current || clientRef.current !== requestClient) return;
      setState((current) => ({
        ...stateForClient(current, requestClient),
        previewError: graphQlUserMessage(error),
      }));
    } finally {
      if (requestId === previewRequestId.current && clientRef.current === requestClient) {
        setState((current) =>
          current.client === requestClient ? { ...current, previewLoading: false } : current
        );
      }
    }
  }, [client, isAuthenticated, loadPreview]);

  useEffect(() => {
    countRequestId.current += 1;
    previewRequestId.current += 1;
    if (!isAuthenticated) {
      setState(emptyNotificationState(null));
      return undefined;
    }

    setState(emptyNotificationState(client));
    void refreshCount();
    const timer = window.setInterval(() => void refreshCount(), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [client, isAuthenticated, refreshCount]);

  useEffect(() => {
    if (isOpen && isAuthenticated) void refreshPreview();
  }, [isAuthenticated, isOpen, refreshPreview]);

  const markRead = useMarkNotificationRead({ client, clientRef, setState });

  const visibleState =
    isAuthenticated && state.client === client ? state : emptyNotificationState(client);

  return {
    countError: visibleState.countError,
    markRead,
    notifications: visibleState.notifications,
    previewError: visibleState.previewError,
    previewLoaded: visibleState.previewLoaded,
    previewLoading: visibleState.previewLoading,
    previewMayBeCapped:
      visibleState.previewLoaded && visibleState.notifications.length === PREVIEW_LIMIT,
    refreshCount,
    refreshPreview,
    unreadCount: visibleState.unreadCount,
  };
}
