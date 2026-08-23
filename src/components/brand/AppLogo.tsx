import { useId } from 'react';

import { APP_BRAND } from '@/constants/brand';

type AppLogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface AppLogoProps {
  size?: AppLogoSize;
  showText?: boolean;
  supportingText?: string;
  className?: string;
}

const sizeClasses: Record<AppLogoSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-16 w-16',
};

const textClasses: Record<AppLogoSize, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export const AppLogo = ({
  size = 'md',
  showText = true,
  supportingText,
  className = '',
}: AppLogoProps) => {
  const gradientId = useId();
  const backgroundGradientId = `${gradientId}-helior-logo-bg`;
  const accentGradientId = `${gradientId}-helior-logo-accent`;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        className={`${sizeClasses[size]} shrink-0`}
        viewBox="0 0 64 64"
        role={showText ? undefined : 'img'}
        aria-hidden={showText ? true : undefined}
        aria-label={showText ? undefined : `${APP_BRAND.productName} logo`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={backgroundGradientId}
            x1="8"
            y1="6"
            x2="58"
            y2="58"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="rgb(var(--color-focus))" />
            <stop offset="0.52" stopColor="rgb(var(--color-accent))" />
            <stop offset="1" stopColor="rgb(var(--color-accent-active))" />
          </linearGradient>
          <linearGradient
            id={accentGradientId}
            x1="18"
            y1="16"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="rgb(var(--color-surface-selected))" />
            <stop offset="1" stopColor="rgb(var(--color-content-inverse))" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill={`url(#${backgroundGradientId})`} />
        <path
          d="M19 19.5C19 17.6 20.6 16 22.5 16S26 17.6 26 19.5V28h12v-8.5C38 17.6 39.6 16 41.5 16S45 17.6 45 19.5v25C45 46.4 43.4 48 41.5 48S38 46.4 38 44.5V36H26v8.5C26 46.4 24.4 48 22.5 48S19 46.4 19 44.5v-25Z"
          fill={`url(#${accentGradientId})`}
        />
        <path
          d="M24.5 32H16.5M47.5 32H39.5M32 28V21M32 36V43"
          stroke="rgb(var(--color-surface-selected))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="16" cy="32" r="4.25" fill="rgb(var(--color-content-inverse))" />
        <circle cx="48" cy="32" r="4.25" fill="rgb(var(--color-content-inverse))" />
        <circle cx="32" cy="20" r="4.25" fill="rgb(var(--color-content-inverse))" />
        <circle cx="32" cy="44" r="4.25" fill="rgb(var(--color-content-inverse))" />
        <circle cx="16" cy="32" r="1.75" fill="rgb(var(--color-focus))" />
        <circle cx="48" cy="32" r="1.75" fill="rgb(var(--color-accent-active))" />
        <circle cx="32" cy="20" r="1.75" fill="rgb(var(--color-accent))" />
        <circle cx="32" cy="44" r="1.75" fill="rgb(var(--color-accent-active))" />
      </svg>

      {showText ? (
        <span className="min-w-0 text-left">
          <span
            className={`block font-semibold leading-tight tracking-tight text-content-primary ${textClasses[size]}`}
          >
            {APP_BRAND.productName}
          </span>
          {supportingText ? (
            <span className="mt-0.5 block text-xs font-medium text-content-muted">
              {supportingText}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
};

export default AppLogo;
