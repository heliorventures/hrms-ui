import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

const Badge = ({ children, variant = 'neutral', size = 'md' }: BadgeProps) => {
  const variantClasses = {
    success:
      'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/10 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-500/20',
    warning:
      'bg-amber-50 text-amber-900 ring-1 ring-amber-500/10 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-500/20',
    danger:
      'bg-red-50 text-red-800 ring-1 ring-red-500/10 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-500/20',
    info: 'bg-sky-50 text-sky-900 ring-1 ring-sky-500/10 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-500/20',
    neutral:
      'bg-slate-100 text-slate-700 ring-1 ring-slate-500/5 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-500/10',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
