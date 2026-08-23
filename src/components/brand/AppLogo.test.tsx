// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AppLogo } from './AppLogo';

afterEach(() => cleanup());

describe('AppLogo accessible naming', () => {
  it('announces the product name once when visible text is present', () => {
    const { container } = render(<AppLogo showText />);

    expect(screen.getByText('Helior HRMS')).toBeTruthy();
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('labels icon-only rendering as the product logo', () => {
    render(<AppLogo showText={false} />);

    expect(screen.getByRole('img', { name: 'Helior HRMS logo' })).toBeTruthy();
  });
});
