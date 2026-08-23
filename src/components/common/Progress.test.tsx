// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Progress from './Progress';

afterEach(cleanup);

describe('Progress', () => {
  it('exposes determinate progress and clamps an excessive value safely', () => {
    render(<Progress label="Profile completion" value={135} min={0} max={100} />);

    const progress = screen.getByRole('progressbar', { name: 'Profile completion' });
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuemax')).toBe('100');
    expect(progress.getAttribute('aria-valuenow')).toBe('100');
    expect(progress.textContent).toContain('100%');
  });

  it('clamps a finite value below the minimum', () => {
    render(<Progress label="Profile completion" value={-25} min={0} max={100} />);

    const progress = screen.getByRole('progressbar', { name: 'Profile completion' });
    expect(progress.getAttribute('aria-valuenow')).toBe('0');
    expect(progress.textContent).toContain('0%');
    expect(progress.querySelector('[aria-hidden="true"]')?.getAttribute('style')).toBe(
      'width: 0%;'
    );
  });

  it.each([
    [0, '50%', 'width: 50%;'],
    [Number.MAX_VALUE / 2, '75%', 'width: 75%;'],
    [-Number.MAX_VALUE / 2, '25%', 'width: 25%;'],
  ])(
    'normalizes an overflowing finite range for value %s without non-finite output',
    (value, expectedText, expectedWidth) => {
      render(
        <Progress
          label="Large finite progress"
          value={value}
          min={-Number.MAX_VALUE}
          max={Number.MAX_VALUE}
        />
      );

      const progress = screen.getByRole('progressbar', { name: 'Large finite progress' });
      expect(progress.getAttribute('aria-valuenow')).toBe(String(value));
      expect(progress.textContent).toContain(expectedText);
      expect(progress.outerHTML).not.toMatch(/NaN|Infinity/);
      expect(progress.querySelector('[aria-hidden="true"]')?.getAttribute('style')).toBe(
        expectedWidth
      );
    }
  );

  it('normalizes large finite values within a same-sign range', () => {
    render(
      <Progress
        label="Large positive progress"
        value={Number.MAX_VALUE * 0.75}
        min={Number.MAX_VALUE / 2}
        max={Number.MAX_VALUE}
      />
    );

    const progress = screen.getByRole('progressbar', { name: 'Large positive progress' });
    expect(progress.textContent).toContain('50%');
    expect(progress.outerHTML).not.toMatch(/NaN|Infinity/);
    expect(progress.querySelector('[aria-hidden="true"]')?.getAttribute('style')).toBe(
      'width: 50%;'
    );
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'treats a non-finite value %s as indeterminate',
    (value) => {
      render(<Progress label="Profile completion" value={value} min={0} max={100} />);

      const progress = screen.getByRole('progressbar', { name: 'Profile completion' });
      expect(progress.getAttribute('aria-valuenow')).toBeNull();
      expect(progress.textContent).not.toContain('NaN');
      expect(progress.textContent).not.toContain('Infinity');
      expect(progress.querySelector('[aria-hidden="true"]')?.getAttribute('style')).toBeNull();
    }
  );

  it.each([
    [0, 0],
    [100, 0],
    [Number.NaN, 100],
    [0, Number.NaN],
    [Number.NEGATIVE_INFINITY, 100],
    [0, Number.POSITIVE_INFINITY],
  ])('treats the invalid range %s to %s as indeterminate', (min, max) => {
    render(<Progress label="Profile completion" value={50} min={min} max={max} />);

    const progress = screen.getByRole('progressbar', { name: 'Profile completion' });
    expect(progress.getAttribute('aria-valuemin')).toBeNull();
    expect(progress.getAttribute('aria-valuemax')).toBeNull();
    expect(progress.getAttribute('aria-valuenow')).toBeNull();
    expect(progress.textContent).not.toContain('%');
    expect(progress.querySelector('[aria-hidden="true"]')?.getAttribute('style')).toBeNull();
  });

  it('labels indeterminate progress without claiming a current value', () => {
    render(<Progress label="Uploading document" />);

    const progress = screen.getByRole('progressbar', { name: 'Uploading document' });
    expect(progress.getAttribute('aria-valuenow')).toBeNull();
    expect(progress.className).toContain('motion-reduce:animate-none');
  });
});
