import type { AppearancePreferences } from './preferences';

export const APPEARANCE_SECTIONS = [
  'Colors & Themes',
  'Typography',
  'Layout & Spacing',
  'Accessibility',
  'Behavior & Effects',
] as const;
export type AppearanceSection = (typeof APPEARANCE_SECTIONS)[number];
export interface AppearanceSetting {
  key: keyof AppearancePreferences;
  label: string;
  description: string;
  options?: readonly (readonly [string, string])[];
}

export const MODE_SETTING: AppearanceSetting = {
  key: 'mode',
  label: 'Appearance mode',
  description: 'System follows your device.',
  options: [
    ['light', 'Light'],
    ['dark', 'Dark'],
    ['system', 'System'],
  ],
};

export const APPEARANCE_SETTINGS: Record<AppearanceSection, AppearanceSetting[]> = {
  'Colors & Themes': [
    {
      key: 'themeStyle',
      label: 'Theme style',
      description: 'Separate navigation from the workspace.',
      options: [
        ['uniform', 'Uniform'],
        ['two-tone', 'Two-tone'],
      ],
    },
  ],
  Typography: [
    {
      key: 'font',
      label: 'Font pairing',
      description: 'Headings and body text.',
      options: [
        ['system', 'System'],
        ['inter', 'Inter'],
        ['manrope', 'Manrope + Inter'],
      ],
    },
    {
      key: 'textSize',
      label: 'Text size',
      description: 'Body text and form controls.',
      options: [
        ['small', 'Small'],
        ['standard', 'Standard'],
        ['large', 'Large'],
      ],
    },
    {
      key: 'lineSpacing',
      label: 'Line spacing',
      description: 'Keep multiline content readable.',
      options: [
        ['compact', 'Compact'],
        ['standard', 'Standard'],
      ],
    },
  ],
  'Layout & Spacing': [
    {
      key: 'density',
      label: 'Density',
      description: 'Spacing, controls and table rows.',
      options: [
        ['compact', 'Compact'],
        ['comfortable', 'Comfortable'],
      ],
    },
    {
      key: 'navigation',
      label: 'Navigation',
      description: 'Auto collapses on smaller desktop widths.',
      options: [
        ['expanded', 'Expanded'],
        ['collapsed', 'Collapsed'],
        ['auto', 'Auto'],
      ],
    },
    {
      key: 'contentWidth',
      label: 'Content width',
      description: 'Use available space on wide screens.',
      options: [
        ['full', 'Full width'],
        ['centered', 'Centered'],
      ],
    },
    {
      key: 'headings',
      label: 'Page headings',
      description: 'Record names and report periods stay visible.',
      options: [
        ['compact', 'Compact'],
        ['hidden', 'Hidden'],
      ],
    },
    {
      key: 'searchWidth',
      label: 'Single-field search',
      description: 'Short searches alongside page actions.',
      options: [
        ['inline', 'Inline'],
        ['full', 'Full row'],
      ],
    },
  ],
  Accessibility: [
    {
      key: 'highContrast',
      label: 'Higher contrast',
      description: 'Stronger text and control boundaries.',
    },
    {
      key: 'enhancedFocus',
      label: 'Enhanced focus outlines',
      description: 'Make keyboard focus easier to see.',
    },
    {
      key: 'underlineLinks',
      label: 'Underline links',
      description: 'Distinguish links without relying on color.',
    },
    {
      key: 'iconLabels',
      label: 'Always show action labels',
      description: 'Keep text beside compact page actions.',
    },
  ],
  'Behavior & Effects': [
    {
      key: 'motion',
      label: 'Motion',
      description: 'System reduced-motion preferences always take priority.',
      options: [
        ['reduced', 'Reduced'],
        ['standard', 'Standard'],
      ],
    },
    {
      key: 'effects',
      label: 'Surface effects',
      description: 'Flat surfaces or subtle depth.',
      options: [
        ['flat', 'Flat'],
        ['subtle', 'Subtle shadows'],
      ],
    },
    {
      key: 'tooltips',
      label: 'Helpful tooltips',
      description: 'Explain compact page actions on hover and focus.',
    },
    {
      key: 'rowHighlight',
      label: 'Highlight table rows',
      description: 'A subtle highlight while scanning tables.',
    },
    {
      key: 'rememberNavigation',
      label: 'Remember navigation state',
      description: 'Restore the last sidebar state in this browser.',
    },
  ],
};
