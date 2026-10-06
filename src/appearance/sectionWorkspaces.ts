import type { AppearanceSection } from './settings';

export const APPEARANCE_WORKSPACES: readonly {
  label: string;
  sections: readonly AppearanceSection[];
}[] = [
  { label: 'Style', sections: ['Colors & Themes', 'Typography'] },
  { label: 'Layout', sections: ['Layout & Spacing'] },
  { label: 'Access & motion', sections: ['Accessibility', 'Behavior & Effects'] },
];

export const appearanceWorkspace = (section: AppearanceSection) =>
  APPEARANCE_WORKSPACES.find((workspace) => workspace.sections.includes(section)) ??
  APPEARANCE_WORKSPACES[0];
