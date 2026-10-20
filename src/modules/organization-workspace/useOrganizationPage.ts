import { useState } from 'react';

import { OrganizationDataError } from './organizationDataError';
import { asRecord, documentItems, sourceVersion } from './organizationDocuments';
import { useOrganizationQuery } from './useOrganizationQuery';

export interface OrganizationDocumentPage {
  schemaVersion: number;
  items: unknown;
  endCursor?: string | null;
  hasNextPage: boolean;
}

export function useOrganizationPage<T extends OrganizationDocumentPage>(
  owner: string | null,
  load: (after: string | null) => Promise<T>
) {
  const [history, setHistory] = useState<{ owner: string | null; cursors: string[] }>({
    owner,
    cursors: [],
  });
  const cursors = history.owner === owner ? history.cursors : [];
  const cursor = cursors.length > 0 ? cursors[cursors.length - 1] : null;
  const query = useOrganizationQuery(
    owner === null ? null : JSON.stringify([owner, cursor]),
    async () => {
      const page = await load(cursor);
      if (page.hasNextPage && !page.endCursor)
        throw new OrganizationDataError(
          'The source page cursor is unavailable. Refresh organization data.'
        );
      if ('graphVersion' in page) sourceVersion(asRecord(page), 'graphVersion');
      if ('organizationVersion' in page) sourceVersion(asRecord(page), 'organizationVersion');
      return { ...page, items: documentItems(page.schemaVersion, page.items) };
    }
  );
  const next = () => {
    const end = query.data?.endCursor;
    if (query.data?.hasNextPage && end) setHistory({ owner, cursors: [...cursors, end] });
  };
  const previous = () => setHistory({ owner, cursors: cursors.slice(0, -1) });
  return { ...query, canPrevious: cursors.length > 0, next, previous };
}
