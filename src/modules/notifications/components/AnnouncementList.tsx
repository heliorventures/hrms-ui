import Badge from '../../../components/common/Badge';
import {
  shortId,
} from '../notificationPresentation';
import { announcementImageSrc, downloadAnnouncementAttachment } from '../announcementAttachment';
import type { AnnouncementRow } from '../notificationTypes';

interface AnnouncementListProps {
  announcements: AnnouncementRow[];
  deptNameById: Map<string, string>;
  loading: boolean;
}

const AnnouncementList = ({ announcements, deptNameById, loading }: AnnouncementListProps) => {
  if (loading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading Announcements...</p>;
  }

  if (announcements.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No Announcements Found.</p>;
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {announcement.body ?? 'No Announcement Body Provided.'}
              </p>
              {announcement.imageAttachment && (
                <div className="mt-3">
                  <img
                    src={announcementImageSrc(announcement.imageAttachment) ?? undefined}
                    alt=""
                    className="max-h-48 max-w-full rounded-md border border-gray-200 object-contain dark:border-gray-600"
                  />
                </div>
              )}
              {announcement.documentAttachment && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (announcement.documentAttachment) {
                        downloadAnnouncementAttachment(announcement.documentAttachment);
                      }
                    }}
                    className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Download attachment
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="info">{announcement.targetAudience ?? 'ALL'}</Badge>
              {announcement.postSource && (
                <Badge variant="neutral" size="sm">
                  {announcement.postSource === 'employee_post' ? 'Team post' : 'Company'}
                </Badge>
              )}
            </div>
          </div>
          {(announcement.targetDepartmentId ||
            announcement.targetLocationId ||
            (announcement.targetAudience?.startsWith('ROLE:') ?? false)) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {announcement.targetDepartmentId ? (
                <Badge variant="neutral" size="sm">
                  Dept{' '}
                  {deptNameById.get(announcement.targetDepartmentId) ??
                    shortId(announcement.targetDepartmentId)}
                </Badge>
              ) : null}
              {announcement.targetLocationId ? (
                <Badge variant="neutral" size="sm">
                  Location {shortId(announcement.targetLocationId)}
                </Badge>
              ) : null}
              {announcement.targetAudience?.startsWith('ROLE:') ? (
                <Badge variant="neutral" size="sm">
                  Role {announcement.targetAudience.slice('ROLE:'.length)}
                </Badge>
              ) : null}
            </div>
          )}
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Publish at:{' '}
            {announcement.publishAt
              ? new Date(announcement.publishAt).toLocaleString('en-IN')
              : 'Immediate'}
            {announcement.expiresAt
              ? ` - Expires ${new Date(announcement.expiresAt).toLocaleString('en-IN')}`
              : ''}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementList;
