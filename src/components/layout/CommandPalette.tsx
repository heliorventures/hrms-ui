import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { canAccessTenantPath } from '../../auth/navAccess';
import { useAuth } from '../../contexts/AuthContext';
import { NAV_CATALOG, type NavCatalogEntry } from '../../navigation/navCatalog';
import { useCommandPalette } from './CommandPaletteContext';

type Row = { entry: NavCatalogEntry };

function scoreEntry(query: string, entry: NavCatalogEntry): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const words = q.split(/\s+/).filter(Boolean);
  const blob = `${entry.label} ${entry.path} ${entry.keywords.join(' ')} ${entry.group}`.toLowerCase();
  let score = 0;
  for (const word of words) {
    if (blob.includes(word)) score += 2;
  }
  if (entry.label.toLowerCase().includes(q)) score += 3;
  return score;
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

  const tenantNavOpts = useMemo(() => ({ can, clientSession }), [can, clientSession]);

  const rows = useMemo<Row[]>(() => {
    const visible = NAV_CATALOG.filter((entry) => canAccessTenantPath(entry.path, tenantNavOpts));
    const q = query.trim();
    if (!q) return visible.map((entry) => ({ entry }));
    return visible
      .map((entry) => ({ entry, score: scoreEntry(q, entry) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ entry }) => ({ entry }));
  }, [query, tenantNavOpts]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return undefined;
    }
    setQuery('');
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 10);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-palette-row="${activeIndex}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen, rows.length]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  const openEntry = useCallback(
    (entry: NavCatalogEntry) => {
      navigate(entry.path);
      close();
    },
    [navigate, close]
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (!rows.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((value) => (value < rows.length - 1 ? value + 1 : 0));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((value) => (value > 0 ? value - 1 : rows.length - 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const row = rows[activeIndex];
      if (row) openEntry(row.entry);
    }
  };

  if (!isOpen) return null;

  let lastGroup: string | null = null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/50 px-3 pt-[12vh] backdrop-blur-sm sm:pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        ref={panelRef}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-indigo-200/30 bg-white shadow-2xl ring-1 ring-indigo-500/10 dark:border-slate-600 dark:bg-slate-900"
        onKeyDown={onKeyDown}
      >
        <div className="border-b border-slate-200/80 bg-indigo-50/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/90">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-200">
                Command
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Search pages and tools
              </p>
            </div>
            <kbd className="hidden shrink-0 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-600 dark:bg-slate-800 sm:inline">
              esc
            </kbd>
          </div>
        </div>

        <div className="p-2">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: grievance, payslip, insights, TDS, org chart"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 shadow-inner placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
            autoComplete="off"
          />
        </div>

        <div
          ref={listRef}
          className="max-h-[min(50vh,420px)] overflow-y-auto px-2 pb-2"
        >
          {rows.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              No matches. Try other words.
            </p>
          ) : null}

          {rows.map(({ entry }, index) => {
            const showGroup = lastGroup !== entry.group;
            if (showGroup) lastGroup = entry.group;

            return (
              <div
                key={entry.path}
                className="mb-0.5"
              >
                {showGroup ? (
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {entry.group}
                  </p>
                ) : null}
                <button
                  type="button"
                  data-palette-row={index}
                  onClick={() => openEntry(entry)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                    activeIndex === index
                      ? 'bg-indigo-100 text-indigo-950 ring-1 ring-indigo-300/60 dark:bg-indigo-900/50 dark:text-white dark:ring-indigo-600/50'
                      : location.pathname === entry.path
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-medium">{entry.label}</span>
                  <span className="shrink-0 font-mono text-[10px] text-slate-400">
                    {entry.path}
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
