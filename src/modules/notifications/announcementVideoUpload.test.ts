// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  announcementVideoError,
  safeVideoLink,
  uploadAnnouncementVideo,
} from './announcementVideoUpload';

class UploadRequest {
  static latest: UploadRequest | undefined;
  upload = {
    onprogress: null as
      | ((event: { lengthComputable: boolean; loaded: number; total: number }) => void)
      | null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 200;
  responseText = '{"stageId":"stage-1"}';
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn();
  abort = vi.fn(() => this.onabort?.());
  constructor() {
    UploadRequest.latest = this;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});
beforeEach(() => {
  UploadRequest.latest = undefined;
});

describe('announcement video input', () => {
  it('sends the raw file, reports byte progress and accepts only a matching completed stage', async () => {
    vi.stubGlobal('XMLHttpRequest', UploadRequest);
    const ticket = {
      stageId: 'stage-1',
      uploadUrl: 'https://example.com/upload?token=short',
      expiresAt: '2099-01-01T00:00:00Z',
    };
    const request = vi.fn().mockResolvedValue({ prepareAnnouncementVideoUpload: ticket });
    const client = { request } as unknown as Parameters<typeof uploadAnnouncementVideo>[0];
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' });
    const progress = vi.fn();
    const result = uploadAnnouncementVideo(client, file, progress, new AbortController().signal);
    await vi.waitFor(() => expect(UploadRequest.latest?.send).toHaveBeenCalledWith(file));
    const xhr = UploadRequest.latest;
    if (!xhr) throw new Error('Upload did not start');
    expect(xhr.send).toHaveBeenCalledWith(file);
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'video/mp4');
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 2, total: 4 });
    expect(progress).toHaveBeenCalledWith(50);
    xhr.onload?.();
    await expect(result).resolves.toEqual({ stageId: 'stage-1', expiresAt: ticket.expiresAt });
  });

  it('aborts the in-progress HTTP upload and rejects with a cancellation error', async () => {
    vi.stubGlobal('XMLHttpRequest', UploadRequest);
    const request = vi.fn().mockResolvedValue({
      prepareAnnouncementVideoUpload: {
        stageId: 'stage-1',
        uploadUrl: 'https://example.com/upload',
        expiresAt: '2099-01-01T00:00:00Z',
      },
    });
    const client = { request } as unknown as Parameters<typeof uploadAnnouncementVideo>[0];
    const abort = new AbortController();
    const result = uploadAnnouncementVideo(
      client,
      new File(['video'], 'clip.mp4', { type: 'video/mp4' }),
      vi.fn(),
      abort.signal
    );
    await vi.waitFor(() => expect(UploadRequest.latest?.send).toHaveBeenCalledOnce());
    const rejected = expect(result).rejects.toMatchObject({ name: 'AbortError' });
    abort.abort();
    await rejected;
    expect(UploadRequest.latest?.abort).toHaveBeenCalledOnce();
  });

  it('accepts a 50 MiB video and rejects larger or unsupported files', () => {
    expect(announcementVideoError({ size: 50 * 1024 * 1024, type: 'video/mp4' })).toBeNull();
    expect(announcementVideoError({ size: 50 * 1024 * 1024 + 1, type: 'video/mp4' })).toMatch(
      /50 MB/
    );
    expect(announcementVideoError({ size: 10, type: 'text/html' })).toMatch(/MP4 or WebM/);
    expect(announcementVideoError({ size: 0, type: 'video/webm' })).toMatch(/empty/);
  });
  it('allows web links while rejecting executable schemes and embedded credentials', () => {
    expect(safeVideoLink(' https://example.com/watch?v=one ')).toBe(
      'https://example.com/watch?v=one'
    );
    expect(safeVideoLink('javascript:alert(1)')).toBeNull();
    expect(safeVideoLink('https://user:password@example.com/video')).toBeNull();
    expect(safeVideoLink('/local/video')).toBeNull();
  });
  it('does not create an upload ticket for an invalid file or an aborted submission', async () => {
    const request = vi.fn();
    const abort = new AbortController();
    const client = { request } as unknown as Parameters<typeof uploadAnnouncementVideo>[0];
    await expect(
      uploadAnnouncementVideo(
        client,
        new File(['x'], 'bad.html', { type: 'text/html' }),
        vi.fn(),
        abort.signal
      )
    ).rejects.toThrow(/MP4 or WebM/);
    abort.abort();
    await expect(
      uploadAnnouncementVideo(
        client,
        new File(['x'], 'clip.mp4', { type: 'video/mp4' }),
        vi.fn(),
        abort.signal
      )
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(request).not.toHaveBeenCalled();
  });
});
