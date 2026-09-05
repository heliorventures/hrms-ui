import { type ReactNode, type RefObject, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { UI_A11Y_TEXT } from '../../constants/uiText';
import { useDialogSurface } from './useDialogSurface';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDismissible?: boolean;
  mobilePresentation?: 'dialog' | 'full-height';
}

const MODAL_SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  initialFocusRef,
  size = 'md',
  isDismissible = true,
  mobilePresentation = 'dialog',
}: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const { isTopmost } = useDialogSurface({
    isOpen,
    isDismissible,
    onClose,
    surfaceRef: dialogRef,
    initialFocusRef,
  });

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const rootClass =
    mobilePresentation === 'full-height'
      ? 'items-end sm:items-center'
      : 'items-center';

  const requestClose = () => {
    if (isDismissible && isTopmost()) onClose();
  };

  const contentClass = [
    'relative flex w-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white',
    'max-h-[100dvh] overscroll-contain sm:max-h-[calc(100dvh-2rem)]',
    mobilePresentation === 'full-height'
      ? 'h-[100dvh] w-full rounded-b-none rounded-t-2xl sm:h-auto sm:w-[min(90vw,42rem)]'
      : `w-full ${MODAL_SIZE_CLASSES[size]} h-auto`,
  ].join(' ');

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex ${rootClass} justify-center bg-slate-950/70 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))]`}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default border-0 bg-transparent p-0 focus-visible:outline-none"
        onMouseDown={requestClose}
        aria-hidden="true"
        tabIndex={-1}
        data-testid="modal-backdrop"
      />
      <div className="relative flex min-h-0 w-full justify-center sm:w-auto">
      <div
        className={contentClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="flex shrink-0 items-start justify-between border-b border-slate-200 py-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] dark:border-slate-700">
          <div className="space-y-1.5">
            <h2 id={titleId} className="text-xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="max-w-prose text-sm text-slate-600 dark:text-slate-300"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={!isDismissible}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            aria-label={UI_A11Y_TEXT.closeModal}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          {children}
        </section>

        {footer ? (
          <footer className="sticky bottom-0 flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-4 dark:border-slate-700 dark:bg-slate-900">
            {footer}
          </footer>
        ) : null}
      </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
