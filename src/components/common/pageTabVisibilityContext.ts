import { createContext } from 'react';

/** Shared with portalled information so hidden panels cannot contribute visible content. */
export const PageTabVisibilityContext = createContext(true);
