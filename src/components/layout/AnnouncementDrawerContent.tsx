import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';
import {
  DashboardCardInitialState,
  DashboardCardRefreshNotice,
} from '../../modules/dashboard/components/DashboardCardQueryState';
import AnnouncementAttachmentAction from '../../modules/notifications/components/AnnouncementAttachmentAction';
import { AnnouncementPreviewDocument } from '../../modules/notifications/notificationQueries';
import AsyncState from '../common/AsyncState';

interface AnnouncementPreview {
  id: string;
  title: string;
  body?: string | null;
  hasImageAttachment: boolean;
  hasDocumentAttachment: boolean;
}

const AnnouncementDrawerContent = ({ onClose }: { onClose: () => void }) => {
  const client = useGraphClient('client');
  const load = useCallback(
    () =>
      client.request<{ announcements: AnnouncementPreview[] }>(AnnouncementPreviewDocument, {
        limit: 3,
      }),
    [client]
  );
  const { data, phase, error, refresh } = useRetainedQuery(load);
  const retry = () => void refresh();
  return (
    <div className="space-y-4">
      {phase === 'initial-loading' || phase === 'initial-error' ? (
        <DashboardCardInitialState
          phase={phase}
          loadingTitle="Loading announcements…"
          errorTitle="Announcements could not be loaded"
          error={error}
          onRetry={retry}
        />
      ) : (
        <>
          <DashboardCardRefreshNotice
            phase={phase}
            loadingTitle="Refreshing announcements…"
            loadingDescription="Showing the last loaded announcements."
            staleTitle="Announcements may be out of date"
            staleDescription="Showing the last loaded announcements."
            error={error}
            onRetry={retry}
          />
          {data?.announcements.length ? (
            data.announcements.map((post) => (
              <details key={post.id} className="rounded-lg border border-line p-3">
                <summary className="cursor-pointer break-words rounded text-sm font-medium text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  {post.title}
                </summary>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm text-content-secondary">
                  {post.body || 'No additional details.'}
                </p>
                <AnnouncementAttachmentAction
                  announcementId={post.id}
                  kind="IMAGE"
                  available={post.hasImageAttachment}
                  compact
                />
                <AnnouncementAttachmentAction
                  announcementId={post.id}
                  kind="DOCUMENT"
                  available={post.hasDocumentAttachment}
                  compact
                />
              </details>
            ))
          ) : (
            <AsyncState
              kind="empty"
              title="No announcements yet"
              description="Company and team posts will appear here."
            />
          )}
          {data?.announcements.length === 3 ? (
            <p className="text-xs text-content-muted">
              Showing 3 recent announcements. More may be available.
            </p>
          ) : null}
        </>
      )}
      <Link
        to="/notifications"
        onClick={onClose}
        className="block min-h-11 rounded-lg px-3 py-2.5 text-center text-sm font-medium text-accent hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        View all announcements
      </Link>
    </div>
  );
};

export default AnnouncementDrawerContent;
