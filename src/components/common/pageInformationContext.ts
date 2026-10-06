import { createContext } from 'react';

export interface PageInformationContextValue {
  register: (id: string) => () => void;
  target: HTMLDivElement | null;
  hasInformation: boolean;
  isOpen: boolean;
  panelId?: string;
  open: (trigger?: HTMLElement) => void;
}

export const PageInformationContext = createContext<PageInformationContextValue | null>(null);
