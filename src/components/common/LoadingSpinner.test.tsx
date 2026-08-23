// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LoadingSpinner from './LoadingSpinner';

afterEach(cleanup);

describe('LoadingSpinner', () => {
  it('uses a truthful default accessible label and reduced-motion-safe animation', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner.querySelector('[aria-hidden="true"]')?.className).toContain(
      'motion-reduce:animate-none'
    );
  });

  it('accepts a caller-provided label', () => {
    render(<LoadingSpinner label="Loading leave balances" size="sm" />);

    expect(screen.getByRole('status', { name: 'Loading leave balances' })).not.toBeNull();
  });
});
