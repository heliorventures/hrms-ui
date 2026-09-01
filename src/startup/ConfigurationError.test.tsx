// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ConfigurationError } from './ConfigurationError';

afterEach(cleanup);

describe('ConfigurationError', () => {
  it('renders startup errors as escaped deployer detail rather than markup', () => {
    render(<ConfigurationError error={'<img src=x onerror=alert(1)>'} />);

    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Configuration error' })).toBeTruthy();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText(/Fix/).textContent).toContain('public/config.json');
  });
});
