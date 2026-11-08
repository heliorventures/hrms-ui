export class DemoError extends Error {
  constructor(code, message, status = 'blocked') {
    super(message);
    this.name = 'DemoError';
    this.code = code;
    this.status = status;
  }
}

export function requireDemo(condition, code, message) {
  if (!condition) throw new DemoError(code, message);
}

// Arbitrary browser/network exception text can contain credentials, headers or tokens.
// Only messages authored by this tool can leave the process.
export function safeFailure(error) {
  if (error instanceof DemoError) return { code: error.code, message: error.message, status: error.status };
  return { code: 'UNEXPECTED_ERROR', message: 'The operation failed. No completed video was published.', status: 'failed' };
}

export function verifiedMutation(body, field, expectedId) {
  requireDemo(!body?.errors?.length, 'MUTATION_REJECTED', `The ${field} operation returned GraphQL errors. Reconcile its result before retrying.`);
  const result = body?.data?.[field];
  requireDemo(typeof result?.id === 'string' && result.id.length > 0, 'MUTATION_UNCONFIRMED', `The ${field} result has no request identity. Do not retry automatically.`);
  requireDemo(!expectedId || result.id === expectedId, 'REQUEST_MISMATCH', 'The response belongs to a different request. Approval recording stopped.');
  return result;
}

export function approvalOutcome(status) {
  const normalized = typeof status === 'string' ? status.toUpperCase() : '';
  requireDemo(['APPROVED', 'PARTIAL_APPROVED', 'PARTIALLY_APPROVED', 'PENDING'].includes(normalized), 'APPROVAL_UNCONFIRMED', 'The approval result does not confirm a recorded approval.');
  const final = normalized !== 'PENDING';
  return { status: normalized, final, caption: final ? 'Approval recorded. Review the updated request status.' : 'Your approval step was recorded. Another approver is still required.' };
}

export function scenesForExport(scenes, maximum, rawDuration) {
  requireDemo(Number.isFinite(maximum) && maximum > 0 && maximum <= 60, 'INVALID_DURATION', 'The maximum clip duration must be between 1 and 60 seconds.');
  requireDemo(scenes.length > 0, 'EMPTY_VIDEO', 'There are no verified scenes to export.');
  let previousEnd = 0;
  const windows = scenes.map(({ start, end }) => {
    requireDemo(Number.isFinite(start) && Number.isFinite(end) && start >= previousEnd && end > start, 'INVALID_TIMELINE', 'Scene timestamps overlap or are invalid.');
    requireDemo(end <= rawDuration + 0.2, 'INCOMPLETE_VIDEO', 'The recorded video does not contain the complete outcome scene.');
    previousEnd = end;
    return { start, end: Math.min(end, rawDuration) };
  });
  const duration = windows.reduce((sum, scene) => sum + scene.end - scene.start, 0);
  requireDemo(duration <= maximum - 0.05, 'VIDEO_TOO_LONG', 'All scenes exceed the duration budget. Shorten the walkthrough; its outcome will not be truncated.');
  return { windows, duration };
}

export function parseSceneWindows(diagnostic) {
  const windows = [...diagnostic.matchAll(/black_start:([\d.]+)\s+black_end:([\d.]+)/g)].map(match => ({ start: Number(match[1]), end: Number(match[2]) }));
  requireDemo(windows.length > 0 && windows.every(window => window.end > window.start), 'SCENES_NOT_FOUND', 'The recording contains no complete presentation scene markers.');
  return windows;
}
