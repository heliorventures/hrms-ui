import { describe, expect, it } from 'vitest';
import { attachmentKindFor, hasAnnouncementAttachment } from './announcementAttachment';
import { deferObjectUrlRevocation } from '../../utils/privateFileAttachment';

describe('announcement attachment lazy-loading contract', () => {
  it('detects attachment presence without exposing storage identifiers or loading file bytes', () => {
    const announcement = {
      hasImageAttachment: true,
      hasDocumentAttachment: true,
    };

    expect(hasAnnouncementAttachment(announcement, 'IMAGE')).toBe(true);
    expect(hasAnnouncementAttachment(announcement, 'DOCUMENT')).toBe(true);
  });

  it('does not report an absent attachment as downloadable', () => {
    expect(hasAnnouncementAttachment({ hasImageAttachment: false }, 'IMAGE')).toBe(false);
  });

  it('maps UI attachment kinds to the GraphQL enum values', () => {
    expect(attachmentKindFor('image')).toBe('IMAGE');
    expect(attachmentKindFor('document')).toBe('DOCUMENT');
  });

  it('defers Blob URL revocation until the browser has accepted a download', () => {
    let deferred: (() => void) | undefined;
    const revoked: string[] = [];

    deferObjectUrlRevocation(
      'blob:private-document',
      (callback) => {
        deferred = callback;
      },
      (url) => revoked.push(url)
    );

    expect(revoked).toEqual([]);
    if (!deferred) throw new Error('expected revocation to be scheduled');
    deferred();
    expect(revoked).toEqual(['blob:private-document']);
  });
});
