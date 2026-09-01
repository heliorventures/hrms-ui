import { type KeyboardEvent, type ReactNode, useRef } from 'react';

export type TabId = string;

export interface TabItem {
  id: TabId;
  label: string;
  panelId: string;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: readonly TabItem[];
  value: TabId;
  onValueChange: (id: TabId) => void;
  orientation?: 'horizontal' | 'vertical';
}

const Tabs = ({
  tabs,
  value,
  onValueChange,
  orientation = 'horizontal',
}: TabsProps) => {
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());

  const selectAndFocus = (nextIndex: number) => {
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    onValueChange(nextTab.id);
    tabRefs.current.get(nextTab.id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentId: TabId) => {
    if (tabs.length === 0) return;
    const currentIndex = Math.max(0, tabs.findIndex((tab) => tab.id === currentId));
    const isHorizontal = orientation === 'horizontal';
    const previousKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    let nextIndex: number | null = null;

    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else if (event.key === previousKey) {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === nextKey) {
      nextIndex = (currentIndex + 1) % tabs.length;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      selectAndFocus(nextIndex);
    }
  };

  const tabClass =
    'flex min-h-[2.75rem] items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:transition-none';

  return (
    <div className="relative">
      <div
        role="tablist"
        aria-orientation={orientation}
        className={`relative mb-6 flex gap-0.5 rounded-lg border border-slate-200/90 bg-slate-100/90 p-1 dark:border-slate-600/80 dark:bg-slate-800/60 ${
          orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-wrap'
        }`}
      >
        {tabs.map((tab) => {
          const active = value === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              role="tab"
              aria-selected={active}
              aria-controls={tab.panelId}
              id={`${tab.panelId}-tab`}
              data-tab-id={tab.id}
              onClick={() => onValueChange(tab.id)}
              onKeyDown={(event) => onKeyDown(event, tab.id)}
              ref={(element) => {
                if (element) tabRefs.current.set(tab.id, element);
                else tabRefs.current.delete(tab.id);
              }}
              tabIndex={active ? 0 : -1}
              className={
                active
                  ? `${tabClass} bg-white font-semibold text-slate-900 shadow-card dark:bg-slate-700 dark:text-white`
                  : `${tabClass} font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-100`
              }
            >
              {tab.icon ? <span className="shrink-0 opacity-80">{tab.icon}</span> : null}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
