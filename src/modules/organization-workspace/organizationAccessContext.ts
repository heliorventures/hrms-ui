import { createContext } from 'react';

/** A child business denial revalidates current grants and removes revoked company state. */
export const OrganizationAccessContext = createContext<(() => void) | null>(null);
