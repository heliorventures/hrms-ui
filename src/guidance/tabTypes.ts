import type { TourContext } from './tourTypes';

export type GuidanceTab = {
  id: string;
  label: string;
  body: string;
  isVisible?: (context: TourContext) => boolean;
};
export type GuidanceTabSet = {
  routePaths: readonly string[];
  anchor: string;
  tabs: readonly GuidanceTab[];
};
export type StepDestination = { tabId?: string; path?: string; keywords?: readonly string[] };
