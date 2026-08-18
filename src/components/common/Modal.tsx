import { ReactNode, useEffect, useId, useRef } from 'react';
import { UI_A11Y_TEXT } from '../../constants/uiText';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDismissible?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ModalStackEntry {
  id: symbol;
  focus: () => void;
}

const modalStack: ModalStackEntry[] = [];
let bodyOverflowBeforeModalStack: string | null = null;

const topmostModal = () => modalStack[modalStack.length - 1];

const isTopmostModal = (id: symbol) => topmostModal()?.id === id;

const focusTopmostModal = () => topmostModal()?.focus();

const registerModal = (entry: ModalStackEntry) => {
  if (modalStack.length === 0) {
    bodyOverflowBeforeModalStack = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  modalStack.push(entry);
};

const unregisterModal = (id: symbol) => {
  const index = modalStack.findIndex((entry) => entry.id === id);
  if (index === -1) return false;
  const wasTopmost = index === modalStack.length - 1;
  modalStack.splice(index, 1);
  if (modalStack.length === 0 && bodyOverflowBeforeModalStack !== null) {
    document.body.style.overflow = bodyOverflowBeforeModalStack;
    bodyOverflowBeforeModalStack = null;
  }
  return wasTopmost;
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  isDismissible = true,
}: ModalProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(isDismissible);
  const modalIdRef = useRef<symbol>();
  if (!modalIdRef.current) modalIdRef.current = Symbol('modal');
  const modalId = modalIdRef.current;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    dismissibleRef.current = isDismissible;
  }, [isDismissible]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTopmostModal(modalId) && dismissibleRef.current) {
        onCloseRef.current();
      }
    };

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !isTopmostModal(modalId)) return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || !dialog.contains(activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    if (isOpen) {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const focusDialog = () => {
        const dialog = dialogRef.current;
        const initialFocus = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (initialFocus ?? dialog)?.focus();
      };
      registerModal({ id: modalId, focus: focusDialog });
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', trapFocus);
      const focusFrame = window.requestAnimationFrame(() => {
        if (isTopmostModal(modalId)) focusDialog();
      });
      return () => {
        window.cancelAnimationFrame(focusFrame);
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', trapFocus);
        const wasTopmost = unregisterModal(modalId);
        if (!wasTopmost) return;
        if (modalStack.length > 0) {
          focusTopmostModal();
        } else if (openerRef.current?.isConnected) {
          openerRef.current.focus();
        }
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', trapFocus);
    };
  }, [isOpen, modalId]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4"
      onClick={() => dismissibleRef.current && onCloseRef.current()}
    >
      <div
        className={`flex max-h-[calc(100vh-2rem)] w-full ${sizeClasses[size]} flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2
            id={titleId}
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={!isDismissible}
            className="rounded-lg p-1 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-gray-700"
            aria-label={UI_A11Y_TEXT.closeModal}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
