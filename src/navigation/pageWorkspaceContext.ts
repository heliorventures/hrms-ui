import { createContext } from 'react';

import type { NavigationDestination } from './navigationModel';

export const PageWorkspaceContext = createContext<{
  title?: string;
  tasks: readonly NavigationDestination[];
  activePath: string;
  select: (path: string) => void;
} | null>(null);
