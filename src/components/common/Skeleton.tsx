import { useEffect, useState, type HTMLAttributes } from 'react';

type SkeletonSemanticProp = 'aria-hidden' | 'aria-label' | 'aria-labelledby' | 'role';

export type SkeletonProps = Omit<HTMLAttributes<HTMLDivElement>, SkeletonSemanticProp> & {
  revealDelayMs?: number;
};

const Skeleton = ({ className = '', revealDelayMs = 150, ...nativeProps }: SkeletonProps) => {
  const delayMs = Math.max(0, revealDelayMs);
  const [isVisible, setIsVisible] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) {
      setIsVisible(true);
      return undefined;
    }

    setIsVisible(false);
    const revealTimer = window.setTimeout(() => setIsVisible(true), delayMs);
    return () => window.clearTimeout(revealTimer);
  }, [delayMs]);

  const safeProps = { ...(nativeProps as HTMLAttributes<HTMLDivElement>) };
  delete safeProps['aria-hidden'];
  delete safeProps['aria-label'];
  delete safeProps['aria-labelledby'];
  delete safeProps.role;

  return (
    <div
      {...safeProps}
      aria-hidden="true"
      className={`rounded-md bg-line-subtle transition-opacity duration-150 motion-reduce:animate-none motion-reduce:transition-none ${isVisible ? 'animate-pulse opacity-100' : 'opacity-0'} ${className}`}
    />
  );
};

export default Skeleton;
