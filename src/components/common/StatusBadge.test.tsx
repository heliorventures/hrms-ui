// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { CheckCircle2 } from 'lucide-react';
import { afterEach, describe, expect, it } from 'vitest';

import StatusBadge from './StatusBadge';

afterEach(cleanup);

describe('StatusBadge', () => {
  it.each(['neutral', 'info', 'success', 'warning', 'danger'] as const)(
    'uses a high-contrast text foreground for the %s tone',
    (tone) => {
      render(<StatusBadge label={`${tone} status`} tone={tone} />);

      const badge = screen.getByText(`${tone} status`).closest(`[data-tone="${tone}"]`);
      expect(badge?.className).toContain('text-content-primary');
      expect(badge?.className).not.toContain(`text-status-${tone}`);
      expect(badge?.className).toContain(`bg-status-${tone}/10`);
      expect(badge?.className).toContain(`ring-status-${tone}/30`);
      expect(badge?.querySelector('svg')?.getAttribute('class')).toContain(`text-status-${tone}`);
    }
  );

  it('keeps supplied icons decorative while preserving high-contrast text', () => {
    render(<StatusBadge label="Approved" tone="success" icon={<CheckCircle2 />} />);

    const badge = screen.getByText('Approved').closest('[data-tone="success"]');
    expect(badge?.className).toContain('text-content-primary');
    expect(badge?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
