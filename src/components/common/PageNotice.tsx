import type { ReactNode } from 'react';

export type PageNoticeVariant = 'error' | 'info' | 'success' | 'warning';

interface PageNoticeProps {
  variant?: PageNoticeVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<PageNoticeVariant, string> = {
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-100',
  info:
    'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-100',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100',
};

const PageNotice = ({ variant = 'info', children, className = '' }: PageNoticeProps) => {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`rounded-md border px-4 py-3 text-sm ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

export default PageNotice;
