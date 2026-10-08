import {
  PrejoiningClientError,
  type PrejoiningForm,
  type PrejoiningPublicClient,
  type PrejoiningWriteInput,
} from './types';

const API_ROOT = '/prejoining-api/form';

const errorKind = (status: number, code?: string) => {
  if (status === 401 || code === 'INVITATION_UNAVAILABLE') return 'unavailable' as const;
  if (code === 'PREJOINING_STALE_REVISION') return 'stale' as const;
  if (code === 'PREJOINING_INVALID_STATE') return 'invalid-state' as const;
  if (status === 413) return 'too-large' as const;
  if (status === 404) return 'not-found' as const;
  if (status === 400) return 'validation' as const;
  return 'unknown' as const;
};

const request = async <T>(token: string, path: string, init: RequestInit = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      ...init,
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: { Authorization: `Bearer ${token}`, ...init.headers },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new PrejoiningClientError('network', 'Unable to reach the pre-joining service.');
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
    throw new PrejoiningClientError(
      errorKind(response.status, body.code),
      body.message ?? 'The request failed.'
    );
  }
  return response.json() as Promise<T>;
};

const jsonWrite = (
  token: string,
  path: string,
  method: string,
  input: PrejoiningWriteInput,
  signal?: AbortSignal
) =>
  request<PrejoiningForm>(token, path, {
    method,
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

const upload = (
  token: string,
  requirementId: string,
  revision: number,
  file: File,
  signal?: AbortSignal,
  onProgress?: (percent: number) => void
) =>
  new Promise<PrejoiningForm>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_ROOT}/documents/${encodeURIComponent(requirementId)}`);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('X-Filename', encodeURIComponent(file.name));
    xhr.setRequestHeader('X-Revision', String(revision));
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response as PrejoiningForm);
      else {
        const body = (xhr.response ?? {}) as { code?: string; message?: string };
        reject(
          new PrejoiningClientError(
            errorKind(xhr.status, body.code),
            body.message ?? 'The upload failed.'
          )
        );
      }
    };
    xhr.onerror = () =>
      reject(new PrejoiningClientError('network', 'Unable to reach the pre-joining service.'));
    xhr.onabort = () => reject(new DOMException('The request was aborted.', 'AbortError'));
    const abort = () => xhr.abort();
    signal?.addEventListener('abort', abort, { once: true });
    xhr.onloadend = () => signal?.removeEventListener('abort', abort);
    xhr.send(file);
  });

export const prejoiningClient: PrejoiningPublicClient = {
  getForm: (token, signal) => request(token, '', { signal }),
  saveDraft: (token, input, signal) => jsonWrite(token, '', 'PUT', input, signal),
  submit: (token, input, signal) => jsonWrite(token, '/submit', 'POST', input, signal),
  uploadDocument: (token, requirementId, revision, file, signal, onProgress) =>
    upload(token, requirementId, revision, file, signal, onProgress),
  deleteDocument: (token, documentId, revision, signal) =>
    request(token, `/documents/${encodeURIComponent(documentId)}`, {
      method: 'DELETE',
      signal,
      headers: { 'X-Revision': String(revision) },
    }),
  downloadDocument: async (token, stagedDocument, signal) => {
    const response = await fetch(`${API_ROOT}/documents/${encodeURIComponent(stagedDocument.id)}`, {
      signal,
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
      throw new PrejoiningClientError(
        errorKind(response.status),
        'Unable to download the document.'
      );
    const blob = await response.blob();
    if (signal?.aborted) throw new DOMException('The request was aborted.', 'AbortError');
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = stagedDocument.filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  },
};
