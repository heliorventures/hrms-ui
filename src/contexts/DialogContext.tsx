import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Modal from '../components/common/Modal';
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

type ConfirmState = ConfirmOptions & { resolve: (v: boolean) => void };
type AlertState = AlertOptions & { resolve: () => void };

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
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...opts, resolve });
    });
  }, []);

  const alertFn = useCallback((opts: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setAlertState({ ...opts, resolve });
    });
  }, []);

  const value = useMemo(
    () => ({ confirm, alert: alertFn }),
    [confirm, alertFn]
  );

  const closeConfirm = (v: boolean) => {
    confirmState?.resolve(v);
    setConfirmState(null);
  };

  const closeAlert = () => {
    alertState?.resolve();
    setAlertState(null);
  };

  const alertAccent =
    alertState?.variant === 'warning'
      ? 'border-l-4 border-amber-500 pl-3'
      : alertState?.variant === 'success'
        ? 'border-l-4 border-emerald-500 pl-3'
        : 'border-l-4 border-sky-500 pl-3';

  return (
    <DialogContext.Provider value={value}>
      {children}

      {confirmState && (
        <Modal
          isOpen
          onClose={() => closeConfirm(false)}
          title={confirmState.title}
          size="sm"
        >
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {confirmState.message}
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => closeConfirm(false)}>
              {confirmState.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              type="button"
              variant={confirmState.variant === 'danger' ? 'danger' : 'primary'}
              onClick={() => closeConfirm(true)}
            >
              {confirmState.confirmLabel ?? 'Confirm'}
            </Button>
          </div>
        </Modal>
      )}

      {alertState && (
        <Modal isOpen onClose={closeAlert} title={alertState.title} size="sm">
          <p
            className={`text-sm leading-relaxed text-slate-700 dark:text-slate-300 ${alertAccent}`}
          >
            {alertState.message}
          </p>
          <div className="mt-6 flex justify-end">
            <Button type="button" variant="primary" onClick={closeAlert}>
              {alertState.okLabel ?? 'OK'}
            </Button>
          </div>
        </Modal>
      )}
    </DialogContext.Provider>
  );
}
