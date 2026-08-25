import { describe, expect, it } from 'vitest';

const moduleSources = import.meta.glob('../../modules/**/*.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const rawRequiredControl = /<(input|select|textarea)\b[^>]*\brequired\b[^>]*>/gms;

describe('required control inventory', () => {
  it('uses shared form controls for every required module field', () => {
    const violations = Object.entries(moduleSources).flatMap(([path, source]) =>
      [...source.matchAll(rawRequiredControl)].map((match) => {
        const line = source.slice(0, match.index).split('\n').length;
        return `${path}:${line} uses a raw required <${match[1]}>`;
      })
    );

    expect(violations).toEqual([]);
  });
});
