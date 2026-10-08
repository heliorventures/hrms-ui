import { useCallback, useEffect, useRef, useState } from 'react';

import { prejoiningClient } from './prejoiningClient';
import { candidateTokenFromHash, documentFileError, validateAnswers } from './prejoiningForm';
import {
  PrejoiningClientError,
  type PrejoiningDocument,
  type PrejoiningForm,
  type PrejoiningPublicClient,
} from './types';

export type PageFailure = 'missing-token' | 'unavailable' | 'network' | 'unknown';

const failureFor = (error: unknown): PageFailure => {
  const kind =
    error instanceof PrejoiningClientError ? error.kind : (error as { kind?: string }).kind;
  if (kind === 'unavailable' || kind === 'expired') return 'unavailable';
  if (kind === 'network') return 'network';
  return 'unknown';
};

interface ActionContext {
  form: PrejoiningForm | null;
  token: string | null;
  answers: Record<string, string>;
  client: PrejoiningPublicClient;
  locked: React.MutableRefObject<boolean>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mutate: (
    operation: (signal: AbortSignal) => Promise<PrejoiningForm>,
    fallback: string,
    preserve: boolean
  ) => Promise<boolean>;
  setProgress: React.Dispatch<React.SetStateAction<number | null>>;
}

const createActions = ({
  form,
  token,
  answers,
  client,
  locked,
  setErrors,
  setMessage,
  setAnswers,
  mutate,
  setProgress,
}: ActionContext) => {
  const write = async (submit: boolean) => {
    if (!form || !token || locked.current) return;
    const fields = submit
      ? form.config.fields
      : form.config.fields.map((field) => ({ ...field, required: false }));
    const nextErrors = validateAnswers(fields, answers);
    if (submit)
      form.config.documents.forEach((requirement) => {
        if (
          requirement.required &&
          !form.documents.some((document) => document.requirementId === requirement.id)
        )
          nextErrors[`document:${requirement.id}`] = `${requirement.label} is required.`;
      });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const input = { revision: form.revision, answers };
    const saved = await mutate(
      (signal) =>
        submit ? client.submit(token, input, signal) : client.saveDraft(token, input, signal),
      'We could not save your details. Review the form and try again.',
      false
    );
    if (saved && !submit) setMessage('Draft saved.');
  };
  const uploadDocument = async (requirementId: string, file: File) => {
    if (!form || !token || locked.current) return;
    const error = documentFileError(file);
    if (error) {
      setErrors((current) => ({ ...current, [`document:${requirementId}`]: error }));
      return;
    }
    await mutate(
      (signal) =>
        client.uploadDocument(token, requirementId, form.revision, file, signal, setProgress),
      'Upload failed. Try again.',
      true
    );
  };
  const deleteDocument = async (document: PrejoiningDocument) => {
    if (form && token && !locked.current)
      await mutate(
        (signal) => client.deleteDocument(token, document.id, form.revision, signal),
        'Could not remove this document. Try again.',
        true
      );
  };
  const downloadDocument = async (document: PrejoiningDocument) => {
    if (form && token && !locked.current)
      await mutate(
        async (signal) => {
          await client.downloadDocument(token, document, signal);
          return form;
        },
        'Download failed. Try again.',
        true
      );
  };
  const setAnswer = (key: string, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };
  return { write, uploadDocument, deleteDocument, downloadDocument, setAnswer };
};

const useTokenLifecycle = (
  setToken: React.Dispatch<React.SetStateAction<string | null>>,
  abortRequests: () => void,
  load: () => Promise<void>,
  reset: () => void
) => {
  useEffect(() => {
    const handleHashChange = () => setToken(candidateTokenFromHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setToken]);
  useEffect(() => {
    abortRequests();
    reset();
    void load();
    return abortRequests;
  }, [abortRequests, load, reset]);
};

const useRequestPool = () => {
  const requests = useRef(new Set<AbortController>());
  const newRequest = useCallback(() => {
    const controller = new AbortController();
    requests.current.add(controller);
    return controller;
  }, []);
  const abortRequests = useCallback(() => {
    requests.current.forEach((controller) => controller.abort());
    requests.current.clear();
  }, []);
  return { requests, newRequest, abortRequests };
};

const recoverMutation = async (
  error: unknown,
  fallback: string,
  load: (preserve?: boolean) => Promise<void>,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setFailure: React.Dispatch<React.SetStateAction<PageFailure | null>>
) => {
  const kind = error instanceof PrejoiningClientError ? error.kind : undefined;
  if (kind === 'stale' || kind === 'invalid-state') {
    setMessage(
      kind === 'stale'
        ? 'The form changed in another request. We refreshed it and kept your unsaved answers. Review and try again.'
        : 'The form status changed. We refreshed the latest status and kept your unsaved answers.'
    );
    await load(true);
  } else if (kind === 'unavailable') setFailure('unavailable');
  else if (
    error instanceof PrejoiningClientError &&
    (kind === 'validation' || kind === 'too-large')
  )
    setMessage(error.message);
  else setMessage(fallback);
};

export const usePrejoiningFormController = ({
  client = prejoiningClient,
}: { client?: PrejoiningPublicClient } = {}) => {
  const [token, setToken] = useState(() => candidateTokenFromHash(window.location.hash));
  const [form, setForm] = useState<PrejoiningForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<PageFailure | null>(token ? null : 'missing-token');
  const [message, setMessage] = useState('');
  const [mutating, setMutating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const mutationLocked = useRef(false);
  const ownerId = useRef(0);
  const { requests, newRequest, abortRequests } = useRequestPool();

  const load = useCallback(
    async (preserveAnswers = false) => {
      if (!token) {
        setForm(null);
        setFailure('missing-token');
        return;
      }
      const requestOwner = ownerId.current;
      const controller = newRequest();
      setFailure(null);
      try {
        const loaded = await client.getForm(token, controller.signal);
        if (requestOwner !== ownerId.current || controller.signal.aborted) return;
        setForm(loaded);
        if (!preserveAnswers) setAnswers(loaded.answers);
      } catch (error) {
        if (requestOwner === ownerId.current && !controller.signal.aborted)
          setFailure(failureFor(error));
      } finally {
        requests.current.delete(controller);
      }
    },
    [client, newRequest, requests, token]
  );

  const reset = useCallback(() => {
    ownerId.current += 1;
    mutationLocked.current = false;
    setMutating(false);
    setUploadProgress(null);
    setForm(null);
    setAnswers({});
    setErrors({});
    setMessage('');
  }, []);
  useTokenLifecycle(setToken, abortRequests, load, reset);

  const recover = useCallback(
    (error: unknown, fallback: string) =>
      recoverMutation(error, fallback, load, setMessage, setFailure),
    [load]
  );

  const mutate = useCallback(
    async (
      operation: (signal: AbortSignal) => Promise<PrejoiningForm>,
      fallback: string,
      preserveAnswers: boolean
    ) => {
      if (mutationLocked.current) return false;
      mutationLocked.current = true;
      setMutating(true);
      setMessage('');
      const controller = newRequest();
      const requestOwner = ownerId.current;
      try {
        const updated = await operation(controller.signal);
        if (requestOwner !== ownerId.current || controller.signal.aborted) return false;
        setForm(updated);
        if (!preserveAnswers) setAnswers(updated.answers);
        setErrors({});
        return true;
      } catch (error) {
        if (requestOwner === ownerId.current && !controller.signal.aborted)
          await recover(error, fallback);
        return false;
      } finally {
        requests.current.delete(controller);
        if (requestOwner === ownerId.current) {
          mutationLocked.current = false;
          setMutating(false);
          setUploadProgress(null);
        }
      }
    },
    [newRequest, recover, requests]
  );

  const actions = createActions({
    form,
    token,
    answers,
    client,
    locked: mutationLocked,
    setErrors,
    setMessage,
    setAnswers,
    mutate,
    setProgress: setUploadProgress,
  });
  return {
    form,
    answers,
    errors,
    failure,
    message,
    mutating,
    uploadProgress,
    retry: () => void load(),
    ...actions,
  };
};
