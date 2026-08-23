import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
};

export type AlertOptions = {
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'success';
  okLabel?: string;
};

type ConfirmRequest = {
  id: symbol;
  kind: 'confirm';
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
};
type AlertRequest = {
  id: symbol;
  kind: 'alert';
  options: AlertOptions;
  resolve: () => void;
};
type DialogRequest = ConfirmRequest | AlertRequest;

type DialogContextValue = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  alert: (opts: AlertOptions) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogs(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialogs must be used within DialogProvider');
  }
  return ctx;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const pendingRef = useRef<DialogRequest[]>([]);
  const acceptedConfirmRef = useRef<symbol | null>(null);
  const mountedRef = useRef(true);
  const [activeRequest, setActiveRequest] = useState<DialogRequest | null>(null);

  const publishActiveRequest = useCallback(() => {
    if (mountedRef.current) setActiveRequest(pendingRef.current[0] ?? null);
  }, []);

  const enqueue = useCallback(
    (request: DialogRequest) => {
      pendingRef.current.push(request);
      publishActiveRequest();
    },
    [publishActiveRequest]
  );

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      enqueue({ id: Symbol('confirm-dialog'), kind: 'confirm', options: opts, resolve });
    });
  }, [enqueue]);

  const alertFn = useCallback((opts: AlertOptions) => {
    return new Promise<void>((resolve) => {
      enqueue({ id: Symbol('alert-dialog'), kind: 'alert', options: opts, resolve });
    });
  }, [enqueue]);

  const value = useMemo(
    () => ({ confirm, alert: alertFn }),
    [confirm, alertFn]
  );

  const settleRequest = useCallback(
    (id: symbol, confirmed = false) => {
      const requestIndex = pendingRef.current.findIndex((request) => request.id === id);
      if (requestIndex === -1) return;
      const [request] = pendingRef.current.splice(requestIndex, 1);
      if (request.kind === 'confirm') request.resolve(confirmed);
      else request.resolve();
      publishActiveRequest();
    },
    [publishActiveRequest]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const pending = pendingRef.current.splice(0);
      for (const request of pending) {
        if (request.kind === 'confirm') request.resolve(false);
        else request.resolve();
      }
    };
  }, []);

  const confirmState = activeRequest?.kind === 'confirm' ? activeRequest : null;
  const alertState = activeRequest?.kind === 'alert' ? activeRequest : null;

  const alertAccent =
    alertState?.options.variant === 'warning'
      ? 'border-l-4 border-amber-500 pl-3'
      : alertState?.options.variant === 'success'
        ? 'border-l-4 border-emerald-500 pl-3'
        : 'border-l-4 border-sky-500 pl-3';

  return (
    <DialogContext.Provider value={value}>
      {children}

      {confirmState ? (
        <ConfirmDialog
          open={Boolean(confirmState)}
          title={confirmState.options.title}
          description={confirmState.options.message}
          confirmLabel={confirmState.options.confirmLabel ?? 'Confirm'}
          cancelLabel={confirmState.options.cancelLabel ?? 'Cancel'}
          onConfirm={() => {
            acceptedConfirmRef.current = confirmState.id;
          }}
          onOpenChange={(nextOpen) => {
            if (nextOpen) return;
            const confirmed = acceptedConfirmRef.current === confirmState.id;
            acceptedConfirmRef.current = null;
            settleRequest(confirmState.id, confirmed);
          }}
          tone={confirmState.options.variant === 'danger' ? 'danger' : 'default'}
        />
      ) : null}

      {alertState && (
        <Modal
          isOpen
          onClose={() => settleRequest(alertState.id)}
          title={alertState.options.title}
          size="sm"
        >
          <p
            className={`text-sm leading-relaxed text-slate-700 dark:text-slate-300 ${alertAccent}`}
          >
            {alertState.options.message}
          </p>
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={() => settleRequest(alertState.id)}
            >
              {alertState.options.okLabel ?? 'OK'}
            </Button>
          </div>
        </Modal>
      )}
    </DialogContext.Provider>
  );
}
