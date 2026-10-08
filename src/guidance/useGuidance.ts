import { createContext, useContext } from 'react';

import type { ActiveTour } from './tourTypes';

export type GuidanceContextValue = {
  activeTour: ActiveTour | null;
  isTourActive: boolean;
  hasPageTour: boolean;
  startPageTour: () => boolean;
  startOverview: (options?: { persistDismissalOnClose?: boolean }) => boolean;
  closeTour: () => void;
};

export const GuidanceContext = createContext<GuidanceContextValue | null>(null);

export function useGuidance(): GuidanceContextValue {
  const context = useContext(GuidanceContext);
  if (!context) throw new Error('useGuidance must be used within a GuidanceProvider.');
  return context;
}
