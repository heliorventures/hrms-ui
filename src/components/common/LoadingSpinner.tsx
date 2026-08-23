import { UI_A11Y_TEXT } from '../../constants/uiText';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const LoadingSpinner = ({ size = 'md', label = UI_A11Y_TEXT.loading }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      aria-atomic="true"
      className="flex items-center justify-center"
    >
      <div
        aria-hidden="true"
        className={`animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none ${sizeClasses[size]}`}
      />
    </div>
  );
};

export default LoadingSpinner;
