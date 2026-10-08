import { type KeyboardEvent, type ReactNode, useRef } from 'react';

import { TAB_LIST_CLASS, tabClassName } from './tabStyles';

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

const Tabs = ({ tabs, value, onValueChange, orientation = 'horizontal' }: TabsProps) => {
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());

  const selectAndFocus = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= tabs.length) return;
    const nextTab = tabs[nextIndex];
    onValueChange(nextTab.id);
    tabRefs.current.get(nextTab.id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentId: TabId) => {
    if (tabs.length === 0) return;
    const currentIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === currentId)
    );
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

  return (
    <div className="relative">
      <div
        role="tablist"
        aria-orientation={orientation}
        className={
          orientation === 'vertical'
            ? 'flex flex-col items-stretch border-l border-slate-200 dark:border-slate-700'
            : TAB_LIST_CLASS
        }
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
              className={tabClassName(active, orientation)}
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
