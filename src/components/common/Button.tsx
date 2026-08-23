import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  busy?: boolean;
  busyLabel?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

const ButtonLeadingContent = ({ busy, startIcon }: Pick<ButtonProps, 'busy' | 'startIcon'>) => {
  if (busy) {
    return (
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
      />
    );
  }
  if (startIcon) {
    return (
      <span aria-hidden="true" className="inline-flex shrink-0">
        {startIcon}
      </span>
    );
  }
  return null;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      busy = false,
      busyLabel = 'Working…',
      startIcon,
      endIcon,
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      'aria-busy': ariaBusy,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50';
    const variantClasses = {
      primary:
        'bg-accent text-content-inverse shadow-sm hover:bg-accent-hover active:bg-accent-active',
      secondary:
        'bg-content-secondary text-content-inverse shadow-sm hover:bg-content-primary active:bg-content-primary',
      outline:
        'border border-line bg-surface text-content-primary shadow-sm hover:bg-surface-selected active:bg-canvas',
      quiet: 'bg-transparent text-content-secondary hover:bg-surface-selected active:bg-canvas',
      danger:
        'bg-status-danger text-content-inverse shadow-sm hover:bg-status-danger/90 active:bg-status-danger/80',
    };
    const sizeClasses = {
      sm: 'min-h-11 px-3 py-2 text-sm md:min-h-8 md:py-1.5',
      md: 'min-h-11 px-4 py-2 text-base md:min-h-10 md:text-sm',
      lg: 'min-h-12 px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        disabled={disabled || busy}
        type={type}
        aria-busy={busy ? true : ariaBusy}
        {...props}
      >
        <ButtonLeadingContent busy={busy} startIcon={startIcon} />
        {children}
        {endIcon ? (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {endIcon}
          </span>
        ) : null}
        {busy ? (
          <>
            {' '}
            <span className="sr-only">{busyLabel}</span>
          </>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
