// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Badge, { type BadgeProps } from './Badge';

afterEach(cleanup);

describe('Badge', () => {
  it.each(['neutral', 'info', 'success', 'warning', 'danger'] as const)(
    'uses a high-contrast text foreground for the %s compatibility variant',
    (variant: NonNullable<BadgeProps['variant']>) => {
      render(<Badge variant={variant}>{variant} label</Badge>);

      const badge = screen.getByText(`${variant} label`).closest(`[data-tone="${variant}"]`);
      expect(badge?.className).toContain('text-content-primary');
      expect(badge?.className).not.toContain(`text-status-${variant}`);
      expect(badge?.className).toContain(`bg-status-${variant}/10`);
      expect(badge?.className).toContain(`ring-status-${variant}/30`);
    }
  );

  it('preserves both compatibility sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small').className).toContain('px-2');

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium').className).toContain('px-2.5');
  });
});
