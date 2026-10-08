import type { GraphQLClient } from 'graphql-request';

import { PrepareAnnouncementVideoDocument, type VideoUploadTicket } from './videoDocuments';

export function safeVideoLink(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function announcementVideoError(file: Pick<File, 'size' | 'type'>): string | null {
  if (file.size === 0) return 'The video file is empty.';
  if (file.size > 50 * 1024 * 1024) return 'Video must be 50 MB or smaller.';
  if (!['video/mp4', 'video/webm'].includes(file.type)) return 'Choose an MP4 or WebM video.';
  return null;
}

const abortError = () => new DOMException('Video upload cancelled.', 'AbortError');
const ensureNotAborted = (signal: AbortSignal) => {
  if (signal.aborted) throw abortError();
};

function sendVideo(
  ticket: VideoUploadTicket,
  file: File,
  progress: (value: number) => void,
  signal: AbortSignal
) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const uploadUrl = safeVideoLink(ticket.uploadUrl);
    if (!uploadUrl) {
      reject(new Error('The upload address is invalid. Please retry.'));
      return;
    }
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const finish = (error?: Error) => {
      signal.removeEventListener('abort', abort);
      if (error) reject(error);
      else resolve();
    };
    xhr.open('POST', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        progress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onerror = () => finish(new Error('Video upload failed. Check your connection and retry.'));
    xhr.onabort = () => finish(abortError());
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        finish(
          new Error(
            xhr.status === 413
              ? 'Video must be 50 MB or smaller.'
              : 'Video upload was not accepted. Please retry.'
          )
        );
        return;
      }
      try {
        const result = JSON.parse(xhr.responseText) as { stageId?: string };
        if (result.stageId !== ticket.stageId) throw new Error('Invalid upload result');
        progress(100);
        finish();
      } catch {
        finish(new Error('The video upload could not be confirmed. Please retry.'));
      }
    };
    signal.addEventListener('abort', abort, { once: true });
    xhr.send(file);
  });
}

export async function uploadAnnouncementVideo(
  client: GraphQLClient,
  file: File,
  progress: (value: number) => void,
  signal: AbortSignal
): Promise<Pick<VideoUploadTicket, 'stageId' | 'expiresAt'>> {
  const error = announcementVideoError(file);
  if (error) throw new Error(error);
  ensureNotAborted(signal);
  const result = await client.request<{ prepareAnnouncementVideoUpload: VideoUploadTicket }>(
    PrepareAnnouncementVideoDocument,
    {
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
    }
  );
  ensureNotAborted(signal);
  await sendVideo(result.prepareAnnouncementVideoUpload, file, progress, signal);
  return {
    stageId: result.prepareAnnouncementVideoUpload.stageId,
    expiresAt: result.prepareAnnouncementVideoUpload.expiresAt,
  };
}
