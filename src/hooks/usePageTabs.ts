import { useSearchParams } from 'react-router-dom';

export interface PageTab {
  id: string;
  label: string;
}

/** Resolve against permitted tabs on every render, including permission changes. */
export function usePageTabs(tabs: readonly PageTab[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const tab = tabs.find((item) => item.id === requested)?.id ?? (tabs.length > 0 ? tabs[0].id : '');
  const setTab = (id: string) => {
    if (id === tab || !tabs.some((item) => item.id === id)) return;
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('tab', id);
        return next;
      },
      { preventScrollReset: true }
    );
  };
  return { tab, setTab };
}
