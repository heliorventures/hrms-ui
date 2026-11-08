const ID = /^[a-z0-9][a-z0-9-]{0,79}$/;
const MEDIA = /^\/video-guides\/assets\/[a-f0-9]{64}\.(mp4|png|jpg|webp)$/;
const DISCLOSURES = ['demo', 'sample-payroll', 'simulated-gps'];

function text(value, maximum) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum;
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validVideo(video) {
  if (!record(video)) return false;
  if (!text(video.id, 80) || !ID.test(video.id)) return false;
  if (!text(video.title, 160) || !text(video.feature, 80)) return false;
  if (!text(video.description, 1000)) return false;
  if (!Array.isArray(video.keywords) || video.keywords.length > 20) return false;
  if (!video.keywords.every((word) => text(word, 80))) return false;
  if (
    !Number.isFinite(video.durationSeconds) ||
    video.durationSeconds <= 0 ||
    video.durationSeconds > 60
  )
    return false;
  if (typeof video.src !== 'string' || !MEDIA.test(video.src) || !video.src.endsWith('.mp4'))
    return false;
  if (
    video.poster !== undefined &&
    (typeof video.poster !== 'string' || !MEDIA.test(video.poster) || video.poster.endsWith('.mp4'))
  )
    return false;
  return (
    DISCLOSURES.includes(video.disclosure) &&
    text(video.updatedAt, 40) &&
    Number.isFinite(Date.parse(video.updatedAt))
  );
}

export function parseVideoGuideCatalog(value) {
  if (!record(value) || value.schemaVersion !== 1 || !Array.isArray(value.videos)) {
    throw new Error('The video library catalog is invalid.');
  }
  if (!text(value.updatedAt, 40) || !Number.isFinite(Date.parse(value.updatedAt))) {
    throw new Error('The video library catalog has an invalid date.');
  }
  if (value.videos.length > 1000 || !value.videos.every(validVideo)) {
    throw new Error('The video library contains an invalid guide.');
  }
  if (new Set(value.videos.map((video) => video.id)).size !== value.videos.length) {
    throw new Error('The video library contains duplicate guide identifiers.');
  }
  return value;
}
