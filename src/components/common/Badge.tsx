import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

const Badge = ({ children, variant = 'neutral', size = 'md' }: BadgeProps) => {
  const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
    neutral: 'bg-status-neutral/10 ring-status-neutral/30',
    info: 'bg-status-info/10 ring-status-info/30',
    success: 'bg-status-success/10 ring-status-success/30',
    warning: 'bg-status-warning/10 ring-status-warning/30',
    danger: 'bg-status-danger/10 ring-status-danger/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs font-medium',
  };

  return (
    <span
      data-tone={variant}
      className={`inline-flex items-center rounded-md font-medium text-content-primary ring-1 ring-inset ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
