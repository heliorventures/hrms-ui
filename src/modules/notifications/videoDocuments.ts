export {
  PrepareAnnouncementVideoDocument,
  AnnouncementVideoDocument,
  NotificationVideoBoardDocument,
} from '../../api/graphql/graphql';

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
