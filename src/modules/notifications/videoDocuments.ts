export const PrepareAnnouncementVideoDocument = `
  mutation PrepareAnnouncementVideo($fileName: String!, $mimeType: String!, $fileSizeBytes: Int!) {
    prepareAnnouncementVideoUpload(fileName: $fileName, mimeType: $mimeType, fileSizeBytes: $fileSizeBytes) {
      stageId uploadUrl expiresAt
    }
  }
`;

export const AnnouncementVideoDocument = `
  query AnnouncementVideo($announcementId: UUID!) {
    announcementVideo(announcementId: $announcementId) { playbackUrl mimeType fileName expiresAt }
  }
`;

export const NotificationVideoBoardDocument = `
  query NotificationVideoBoard($limit: Int! = 20) {
    unreadNotificationCount
    announcements(limit: $limit) {
      id title body targetAudience targetDepartmentId targetLocationId postSource publishAt expiresAt
      hasImageAttachment hasDocumentAttachment hasVideoAttachment videoLink
    }
    notifications(limit: $limit) { id kind title message actionUrl isRead createdAt }
  }
`;

export interface VideoUploadTicket {
  stageId: string;
  uploadUrl: string;
  expiresAt: string;
}
export interface VideoPlayback {
  playbackUrl: string;
  mimeType: string;
  fileName: string;
  expiresAt: string;
}
