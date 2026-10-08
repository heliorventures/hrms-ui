// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AnnouncementVideoDocument } from '../videoDocuments';

import AnnouncementVideo from './AnnouncementVideo';

const state = vi.hoisted(() => ({ tenant: 'tenant-a', client: { request: vi.fn() } }));
vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: state.tenant } }),
}));
vi.mock('../../../contexts/AuthContext', () => ({ useAuth: () => ({ clientSession: null }) }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
beforeEach(() => {
  state.tenant = 'tenant-a';
  state.client = { request: vi.fn() };
});
afterEach(cleanup);
const playback = {
  playbackUrl: 'https://example.com/files/announcement-video/play?token=short',
  mimeType: 'video/mp4',
  fileName: 'Site safety.mp4',
  expiresAt: '2099-01-01T00:00:00Z',
};

describe('announcement video playback', () => {
  it('opens external video in a separate tab without requesting private media', () => {
    render(<AnnouncementVideo announcementId="a" link="https://example.com/watch" />);
    const link = screen.getByRole<HTMLAnchorElement>('link', { name: 'Open video in a new tab' });
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
    expect(state.client.request).not.toHaveBeenCalled();
  });
  it('loads private video only on request and offers renewal after playback fails', async () => {
    state.client.request.mockResolvedValue({ announcementVideo: playback });
    render(<AnnouncementVideo announcementId="a" available />);
    expect(state.client.request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Play video' }));
    const video = await screen.findByLabelText<HTMLVideoElement>('Site safety.mp4');
    expect(video.controls).toBe(true);
    expect(video.preload).toBe('metadata');
    expect(video.src).toBe(playback.playbackUrl);
    expect(state.client.request).toHaveBeenCalledWith(AnnouncementVideoDocument, {
      announcementId: 'a',
    });
    fireEvent.error(video);
    fireEvent.click(screen.getByRole('button', { name: 'Retry video' }));
    await waitFor(() => expect(state.client.request).toHaveBeenCalledTimes(2));
  });
  it('discards delayed playback from the previous tenant', async () => {
    let finish!: (value: unknown) => void;
    state.client.request.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const view = render(<AnnouncementVideo announcementId="a" available />);
    fireEvent.click(screen.getByRole('button', { name: 'Play video' }));
    state.tenant = 'tenant-b';
    state.client = { request: vi.fn() };
    view.rerender(<AnnouncementVideo announcementId="a" available />);
    await act(() => Promise.resolve(finish({ announcementVideo: playback })));
    expect(screen.queryByLabelText('Site safety.mp4')).toBeNull();
    expect(screen.getByRole('button', { name: 'Play video' })).toBeTruthy();
  });
});
