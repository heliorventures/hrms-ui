import { PALETTES, type PaletteId } from './palettes';

export interface AppearancePreferences {
  mode: 'light' | 'dark' | 'system';
  palette: PaletteId;
  themeStyle: 'uniform' | 'two-tone';
  font: 'system' | 'inter' | 'manrope';
  textSize: 'small' | 'standard' | 'large';
  lineSpacing: 'compact' | 'standard';
  density: 'compact' | 'comfortable';
  navigation: 'expanded' | 'collapsed' | 'auto';
  contentWidth: 'full' | 'centered';
  headings: 'compact' | 'hidden';
  searchWidth: 'inline' | 'full';
  highContrast: boolean;
  enhancedFocus: boolean;
  underlineLinks: boolean;
  iconLabels: boolean;
  motion: 'reduced' | 'standard';
  effects: 'flat' | 'subtle';
  tooltips: boolean;
  rowHighlight: boolean;
  rememberNavigation: boolean;
}

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  mode: 'system',
  palette: 'indigo',
  themeStyle: 'two-tone',
  font: 'manrope',
  textSize: 'small',
  lineSpacing: 'compact',
  density: 'compact',
  navigation: 'expanded',
  contentWidth: 'full',
  headings: 'compact',
  searchWidth: 'inline',
  highContrast: false,
  enhancedFocus: true,
  underlineLinks: false,
  iconLabels: true,
  motion: 'reduced',
  effects: 'flat',
  tooltips: true,
  rowHighlight: true,
  rememberNavigation: true,
};

const CHOICES = {
  mode: ['light', 'dark', 'system'],
  palette: PALETTES.map(({ id }) => id),
  themeStyle: ['uniform', 'two-tone'],
  font: ['system', 'inter', 'manrope'],
  textSize: ['small', 'standard', 'large'],
  lineSpacing: ['compact', 'standard'],
  density: ['compact', 'comfortable'],
  navigation: ['expanded', 'collapsed', 'auto'],
  contentWidth: ['full', 'centered'],
  headings: ['compact', 'hidden'],
  searchWidth: ['inline', 'full'],
  motion: ['reduced', 'standard'],
  effects: ['flat', 'subtle'],
} satisfies Partial<Record<keyof AppearancePreferences, readonly string[]>>;

function validValue(key: keyof AppearancePreferences, value: unknown): boolean {
  if (typeof DEFAULT_APPEARANCE[key] === 'boolean') return typeof value === 'boolean';
  const values: readonly string[] = CHOICES[key as keyof typeof CHOICES];
  return typeof value === 'string' && values.includes(value);
}

export function parseAppearance(value: unknown): AppearancePreferences {
  const result = { ...DEFAULT_APPEARANCE };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  for (const key of Object.keys(result) as (keyof AppearancePreferences)[]) {
    const candidate: unknown = (value as Record<string, unknown>)[key];
    if (validValue(key, candidate)) Object.assign(result, { [key]: candidate });
  }
  return result;
}
