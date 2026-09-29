import type { TourDefinition } from '../../guidance/tourTypes';

export const appearanceTour: TourDefinition = {
  id: 'appearance',
  routePaths: ['appearance'],
  steps: [
    {
      id: 'appearance-sections',
      anchor: 'appearance-sections',
      title: 'Choose a settings section',
      body: 'Use these sections to adjust colors, text, spacing, accessibility, and behavior.',
    },
    {
      id: 'appearance-mode',
      anchor: 'appearance-setting-mode',
      title: 'Choose light or dark mode',
      body: 'Appearance mode can follow your device or stay light or dark in this browser.',
    },
    {
      id: 'appearance-colors',
      anchor: 'appearance-accent-colors',
      title: 'Preview accent colors',
      body: 'Choose an accent palette. Status colors keep their existing meanings.',
    },
    {
      id: 'appearance-reset',
      anchor: 'appearance-reset-defaults',
      title: 'Restore defaults in the preview',
      body: 'Reset defaults changes the current draft. Save preferences to apply it.',
    },
    {
      id: 'appearance-save',
      anchor: 'appearance-save',
      title: 'Save your preferences',
      body: 'Save applies the preview in this browser. Cancel restores the last saved preferences.',
    },
  ],
};
