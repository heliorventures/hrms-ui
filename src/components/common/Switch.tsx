import { forwardRef, useCallback, useId } from 'react';
import type { ButtonHTMLAttributes, MouseEvent } from 'react';

import { mergeDescribedBy } from './FormField';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      label,
      description,
      checked,
      onChange,
      onClick,
      disabled,
      className = '',
      type = 'button',
      'aria-describedby': callerDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const labelId = `${generatedId}-label`;
    const descriptionId = description ? `${generatedId}-description` : undefined;
    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented && !disabled) onChange(!checked);
      },
      [checked, disabled, onChange, onClick]
    );

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={mergeDescribedBy(callerDescribedBy, descriptionId)}
        disabled={disabled}
        onClick={handleClick}
        className={`flex min-h-11 items-center gap-3 rounded-md text-left text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60 md:min-h-8 ${className}`}
      >
        <span
          aria-hidden="true"
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors motion-reduce:transition-none ${
            checked ? 'bg-accent' : 'bg-line-strong'
          }`}
        >
          <span
            className={`pointer-events-none mt-0.5 size-4 rounded-full bg-surface shadow-sm transition-transform motion-reduce:transition-none ${
              checked ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </span>
        <span className="min-w-0">
          <span id={labelId} className="block text-base font-medium md:text-sm">
            {label}
          </span>
          {description ? (
            <span id={descriptionId} className="mt-0.5 block text-sm text-content-muted">
              {description}
            </span>
          ) : null}
        </span>
      </button>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
