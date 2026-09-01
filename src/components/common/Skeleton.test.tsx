// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Skeleton, { type SkeletonProps } from './Skeleton';

afterEach(cleanup);

describe('Skeleton', () => {
  it('stays decorative and disables animation when reduced motion is requested', () => {
    const { container } = render(<Skeleton className="h-6 w-40" />);
    const skeleton = container.firstElementChild;

    expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton?.getAttribute('role')).toBeNull();
    expect(skeleton?.className).toContain('motion-reduce:animate-none');
  });

  it('strips conflicting runtime semantics and keeps the decorative contract authoritative', () => {
    const conflictingRuntimeProps = {
      'aria-hidden': false,
      'aria-label': 'Loading employee details',
      'aria-labelledby': 'loading-heading',
      role: 'status',
    } as unknown as SkeletonProps;
    const { container } = render(<Skeleton {...conflictingRuntimeProps} />);
    const skeleton = container.firstElementChild;

    expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton?.getAttribute('role')).toBeNull();
    expect(skeleton?.getAttribute('aria-label')).toBeNull();
    expect(skeleton?.getAttribute('aria-labelledby')).toBeNull();
  });

  it('preserves its layout while delaying visual reveal for 150 ms by default', () => {
    vi.useFakeTimers();
    const { container } = render(<Skeleton className="h-6 w-40" />);
    const skeleton = container.firstElementChild;

    expect(skeleton?.className).toContain('h-6');
    expect(skeleton?.className).toContain('w-40');
    expect(skeleton?.className).toContain('opacity-0');

    act(() => {
      void vi.advanceTimersByTime(149);
    });
    expect(skeleton?.className).toContain('opacity-0');

    act(() => {
      void vi.advanceTimersByTime(1);
    });
    expect(skeleton?.className).toContain('opacity-100');
    vi.useRealTimers();
  });
});
