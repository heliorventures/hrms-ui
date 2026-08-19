import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { canAccessTenantPath } from '../../auth/navAccess';
import { UI_A11Y_TEXT, UI_EMPTY_TEXT } from '../../constants/uiText';
import { useAuth } from '../../contexts/AuthContext';
import {
  NAVIGATION_DESTINATIONS,
  NAVIGATION_SECTIONS,
  type NavigationDestination,
} from '../../navigation/navigationModel';
import {
  accessibleDestinations,
  filterNavigationDestinations,
} from '../../navigation/navigationSelectors';

import { useCommandPalette } from './CommandPaletteContext';

interface CommandRow {
  destination: NavigationDestination;
  group: string;
}

const sectionLabels = new Map(NAVIGATION_SECTIONS.map((section) => [section.key, section.label]));

function groupLabel(destination: NavigationDestination): string {
  return destination.section
    ? (sectionLabels.get(destination.section) ?? 'Workspace')
    : 'Workspace';
}

const CommandPalette = () => {
  const { isOpen, close } = useCommandPalette();
  const navigate = useNavigate();
  const location = useLocation();
  const { can, clientSession } = useAuth();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tenantNavOptions = useMemo(() => ({ can, clientSession }), [can, clientSession]);

  const accessible = useMemo(
    () =>
      accessibleDestinations(NAVIGATION_DESTINATIONS, (path) =>
        canAccessTenantPath(path, tenantNavOptions)
      ),
    [tenantNavOptions]
  );
  const rows = useMemo<CommandRow[]>(
    () =>
      filterNavigationDestinations(accessible, query).map((destination) => ({
        destination,
        group: groupLabel(destination),
      })),
    [accessible, query]
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    setQuery('');
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 10);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeRow = listRef.current.querySelector<HTMLElement>(
      `[data-palette-row="${activeIndex}"]`
    );
    activeRow?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen, rows.length]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleOutsideClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) close();
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, close]);

  const openDestination = useCallback(
    (destination: NavigationDestination) => {
      navigate(destination.path);
      close();
    },
    [navigate, close]
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'Tab' && panelRef.current) {
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('input, button:not([disabled])')
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (!rows.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current < rows.length - 1 ? current + 1 : 0));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current > 0 ? current - 1 : rows.length - 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const row = rows[activeIndex];
      if (row) openDestination(row.destination);
    }
  };

  if (!isOpen) return null;

  let lastGroup: string | null = null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/55 px-3 pt-[10vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={UI_A11Y_TEXT.commandPalette}
    >
      <div
        ref={panelRef}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-indigo-500/10 dark:border-slate-600 dark:bg-slate-900"
        onKeyDown={handleKeyDown}
      >
        <div className="border-b border-slate-200/80 bg-indigo-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/90">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-indigo-950 dark:text-indigo-100">
                Go to a page or tool
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Search by task, such as payslip, leave, or employee
              </p>
            </div>
            <kbd className="shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-600 dark:bg-slate-800">
              Esc
            </kbd>
          </div>
        </div>

        <div className="p-3">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages and tools…"
            aria-label="Search pages and tools"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            autoComplete="off"
          />
        </div>

        <div ref={listRef} className="max-h-[min(55vh,460px)] overflow-y-auto px-3 pb-3">
          {rows.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">{UI_EMPTY_TEXT.matches}</p>
          ) : null}

          {rows.map(({ destination, group }, index) => {
            const showGroup = lastGroup !== group;
            if (showGroup) lastGroup = group;

            return (
              <div key={destination.path} className="mb-0.5">
                {showGroup ? (
                  <p className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 first:pt-1">
                    {group}
                  </p>
                ) : null}
                <button
                  type="button"
                  data-palette-row={index}
                  onClick={() => openDestination(destination)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    activeIndex === index
                      ? 'bg-indigo-100 text-indigo-950 ring-1 ring-indigo-300/60 dark:bg-indigo-900/50 dark:text-white dark:ring-indigo-600/50'
                      : location.pathname === destination.path
                        ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-medium">{destination.label}</span>
                  <span className="shrink-0 font-mono text-[10px] text-slate-400">
                    {destination.path}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
