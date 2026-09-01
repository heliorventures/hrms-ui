import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { UI_A11Y_TEXT } from '../../constants/uiText';
import type { ModalProps } from './Modal';
import { useDialogSurface } from './useDialogSurface';

export interface DrawerProps extends Omit<ModalProps, 'size' | 'mobilePresentation'> {
  side?: 'left' | 'right';
}

const Drawer = ({
  side = 'right',
  title,
  description,
  children,
  footer,
  isOpen,
  onClose,
  initialFocusRef,
  isDismissible = true,
}: DrawerProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { isTopmost } = useDialogSurface({
    isOpen,
    isDismissible,
    onClose,
    surfaceRef: drawerRef,
    initialFocusRef,
  });

  if (!isOpen || typeof document === 'undefined') return null;

  const requestClose = () => {
    if (isDismissible && isTopmost()) onClose();
  };
  const sideClass = side === 'left' ? 'left-0 border-r' : 'right-0 border-l';

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/70" role="presentation">
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        data-testid="modal-backdrop"
        className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent p-0 focus-visible:outline-none"
        onMouseDown={requestClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`fixed inset-y-0 ${sideClass} flex h-[100dvh] w-[min(100vw,26rem)] min-h-0 flex-col overflow-hidden overscroll-contain border-slate-200 bg-white text-slate-950 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white`}
      >
        <header className="flex shrink-0 items-start justify-between border-b border-slate-200 pb-4 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] dark:border-slate-700">
          <div className="space-y-1.5">
            <h2 id={titleId} className="text-xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="max-w-prose text-sm text-slate-600 dark:text-slate-300">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={!isDismissible}
            className="min-h-11 min-w-11 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            aria-label={UI_A11Y_TEXT.closeModal}
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-5 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]">
          {children}
        </section>

        {footer ? (
          <footer className="sticky bottom-0 flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-4 dark:border-slate-700 dark:bg-slate-900">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
