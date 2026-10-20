import { useContext, useEffect, useRef, useState } from 'react';

import { useActionFeedback } from '../../hooks/useActionFeedback';

import { OrganizationAccessContext } from './organizationAccessContext';
import { organizationAccessDenied } from './organizationAccessError';
import { organizationUserMessage } from './organizationDataError';

/** Metadata writes are confirmed by the organization service; source business writes use the command journal. */
export function useOrganizationAction(onSaved: () => void) {
  const revalidateAccess = useContext(OrganizationAccessContext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  const lock = useRef(false);
  const feedback = useActionFeedback();
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const run = async (action: () => Promise<unknown>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
      if (!active.current) return;
      feedback('saved');
      onSaved();
    } catch (cause) {
      if (active.current) {
        setError(organizationUserMessage(cause));
        if (organizationAccessDenied(cause)) revalidateAccess?.();
      }
    } finally {
      lock.current = false;
      if (active.current) setBusy(false);
    }
  };
  return { busy, error, run };
}
