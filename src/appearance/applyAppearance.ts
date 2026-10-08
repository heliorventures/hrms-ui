import type { CSSProperties } from 'react';

import { PALETTES } from './palettes';
import type { AppearancePreferences } from './preferences';

function interactionColor(color: string, dark: boolean, amount: number): string {
  const target = dark ? 255 : 0;
  return color
    .split(' ')
    .map((channel) => Math.round(Number(channel) + (target - Number(channel)) * amount))
    .join(' ');
}

export function appearanceAttributes(preferences: AppearancePreferences) {
  return Object.fromEntries(
    Object.entries(preferences).map(([key, value]) => [
      `data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
      String(value),
    ])
  );
}

export function appearanceVariables(
  preferences: AppearancePreferences,
  dark: boolean
): CSSProperties {
  const palette = PALETTES.find(({ id }) => id === preferences.palette) ?? PALETTES[0];
  const accent = dark ? palette.dark : palette.light;
  return {
    '--color-accent': accent,
    '--color-accent-hover': interactionColor(accent, dark, 0.08),
    '--color-accent-active': interactionColor(accent, dark, 0.16),
    '--color-focus': accent,
    '--color-content-inverse': dark ? '15 23 42' : '255 255 255',
  } as CSSProperties;
}

export function applyAppearance(
  preferences: AppearancePreferences,
  dark: boolean,
  root = document.documentElement
): void {
  for (const [key, value] of Object.entries(appearanceAttributes(preferences)))
    root.setAttribute(key, value);
  for (const [key, value] of Object.entries(appearanceVariables(preferences, dark)))
    root.style.setProperty(key, String(value));
}
