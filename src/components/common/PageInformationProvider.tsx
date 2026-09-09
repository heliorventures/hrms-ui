import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import Drawer from './Drawer';
import { PageInformationContext } from './pageInformationContext';

interface PageInformationProviderProps {
  children: ReactNode;
  /** Route and authorization identity; changing either dismisses stale information. */
  scopeKey: string;
}

const PageInformationProvider = ({ children, scopeKey }: PageInformationProviderProps) => {
  const [sections, setSections] = useState<ReadonlyMap<string, string>>(() => new Map());
  const [openScope, setOpenScope] = useState<string | null>(null);
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const hasInformation = Array.from(sections.values()).includes(scopeKey);
  const isOpen = openScope === scopeKey && hasInformation;

  useEffect(() => setOpenScope(null), [scopeKey]);
  useEffect(() => {
    if (!hasInformation) setOpenScope(null);
  }, [hasInformation]);

  const register = useCallback(
    (id: string) => {
      setSections((current) => new Map(current).set(id, scopeKey));
      return () => {
        setSections((current) => {
          const next = new Map(current);
          next.delete(id);
          return next;
        });
      };
    },
    [scopeKey]
  );
  const open = useCallback(() => setOpenScope(scopeKey), [scopeKey]);
  const close = useCallback(() => setOpenScope(null), []);
  const value = useMemo(
    () => ({ register, target: isOpen ? target : null, hasInformation, isOpen, open }),
    [register, target, hasInformation, isOpen, open]
  );

  return (
    <PageInformationContext.Provider value={value}>
      {children}
      <Drawer title="Page information" isOpen={isOpen} onClose={close} side="right">
        <div ref={setTarget} className="space-y-5 break-words" />
      </Drawer>
    </PageInformationContext.Provider>
  );
};

export default PageInformationProvider;
