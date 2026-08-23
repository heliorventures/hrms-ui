import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import Button from './Button';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'aria-labelledby'
> {
  label: string;
  icon: ReactNode;
  variant?: 'quiet' | 'outline' | 'danger';
  size?: 'sm' | 'md';
}

type RuntimeAccessibleNameProps = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((runtimeProps, ref) => {
  const {
    label,
    icon,
    variant = 'quiet',
    size = 'md',
    className = '',
    type = 'button',
    'aria-label': ignoredAriaLabel,
    'aria-labelledby': ignoredAriaLabelledBy,
    ...props
  } = runtimeProps as IconButtonProps & RuntimeAccessibleNameProps;
  void ignoredAriaLabel;
  void ignoredAriaLabelledBy;

  return (
    <Button
      {...props}
      ref={ref}
      type={type}
      variant={variant}
      size={size}
      aria-label={label}
      className={`min-w-11 px-0 md:min-w-8 ${className}`}
    >
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
    </Button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
