import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessTenantPath } from '../../auth/navAccess';
import { useTenant } from '../../contexts/TenantContext';
import { useDataStore } from '../../store/DataStoreContext';
import { NAV_CATALOG, type NavCatalogEntry } from '../../navigation/navCatalog';
import { useCommandPalette } from './CommandPaletteContext';
import type { Employee } from '../../types';

function scoreEntry(q: string, e: NavCatalogEntry): number {
  if (!q.trim()) return 1;
  const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const blob = `${e.label} ${e.path} ${e.keywords.join(' ')} ${e.group}`.toLowerCase();
  let s = 0;
  for (const w of words) {
    if (blob.includes(w)) s += 2;
  }
  if (e.label.toLowerCase().includes(q.toLowerCase().trim())) s += 3;
  return s;
}

type Row = { kind: 'person'; emp: Employee } | { kind: 'nav'; entry: NavCatalogEntry };

const CommandPalette = () => {
  const { isOpen, close } = useCommandPalette();
  const navigate = useNavigate();
  const location = useLocation();
  const { isElevated, can, clientSession, showTenantAdminNav, showHrNav } = useAuth();
  const jwtPermissionCount = clientSession?.permissions.size ?? 0;
  const tenantNavOpts = useMemo(
    () => ({
      isElevated,
      can,
      jwtPermissionCount,
      showTenantAdminNav,
      showHrNav,
      clientSession,
    }),
    [isElevated, can, jwtPermissionCount, showTenantAdminNav, showHrNav, clientSession]
  );
  const { currentTenant } = useTenant();
  const { getEmployees } = useDataStore();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const catalog = useMemo(
    () =>
      NAV_CATALOG.filter((e) => {
        if (e.adminOnly && !showTenantAdminNav) return false;
        return canAccessTenantPath(e.path, tenantNavOpts);
      }),
    [showTenantAdminNav, tenantNavOpts]
  );

  const filteredNav = useMemo(() => {
    const query = q.trim();
    if (!query) {
      return catalog;
    }
    const scored = catalog
      .map((e) => ({ e, s: scoreEntry(query, e) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    if (scored.length) return scored.map((x) => x.e);
    return catalog.filter(
      (e) =>
        e.label.toLowerCase().includes(query.toLowerCase()) ||
        e.keywords.some((k) => k.includes(query.toLowerCase()))
    );
  }, [catalog, q]);

  const peopleMatch = useMemo(() => {
    if ((!showHrNav && !showTenantAdminNav) || !currentTenant?.id) return [];
    if (!q.trim() || q.length < 2) return [];
    const list = getEmployees(currentTenant.id);
    const t = q.toLowerCase();
    return list
      .filter(
        (em) =>
          em.name.toLowerCase().includes(t) ||
          em.department.toLowerCase().includes(t) ||
          em.employeeId.toLowerCase().includes(t)
      )
      .slice(0, 8);
  }, [getEmployees, currentTenant?.id, q, showHrNav, showTenantAdminNav]);

  const rows: Row[] = useMemo(() => {
    const p: Row[] = peopleMatch.map((emp) => ({ kind: 'person' as const, emp }));
    const n: Row[] = filteredNav.map((entry) => ({ kind: 'nav' as const, entry }));
    return [...p, ...n];
  }, [peopleMatch, filteredNav]);

  useEffect(() => {
    if (isOpen) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setIdx(0);
  }, [q, isOpen]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-palette-row="${idx}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [idx, isOpen, rows.length]);

  const goNav = useCallback(
    (e: NavCatalogEntry) => {
      navigate(e.path);
      close();
    },
    [navigate, close]
  );

  const goPerson = useCallback(
    (id: string) => {
      navigate(`/organization/employees/${id}`);
      close();
    },
    [navigate, close]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (!rows.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => (i < rows.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => (i > 0 ? i - 1 : rows.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const row = rows[idx];
      if (row?.kind === 'nav') goNav(row.entry);
      else if (row?.kind === 'person') goPerson(row.emp.id);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen, close]);

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
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-200/30 bg-white shadow-2xl ring-1 ring-indigo-500/10 dark:border-slate-600 dark:bg-slate-900"
        onKeyDown={onKeyDown}
      >
        <div className="border-b border-slate-200/80 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/80 px-4 py-3 dark:border-slate-700 dark:from-slate-800/90 dark:via-slate-900 dark:to-violet-950/40">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-200">
                Kabi command
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Search pages, tools, and people — type like you would ask a copilot
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try: grievance, payslip, insights, TDS, org chart…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-3 pr-3 text-sm text-slate-900 shadow-inner placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
            autoComplete="off"
          />
        </div>

        <div ref={listRef} className="max-h-[min(50vh,420px)] overflow-y-auto px-2 pb-2">
          {rows.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate-500">No matches — try other words.</p>
          )}

          {rows.map((row, i) => {
            if (row.kind === 'person') {
              const em = row.emp;
              const showPeopleHeading = i === 0 || rows[i - 1]!.kind !== 'person';
              return (
                <div key={`p-${em.id}`} className="mb-0.5">
                  {showPeopleHeading && (
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      People
                    </p>
                  )}
                  <button
                    type="button"
                    data-palette-row={i}
                    onClick={() => goPerson(em.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                      idx === i
                        ? 'bg-indigo-100 text-indigo-950 ring-1 ring-indigo-300/60 dark:bg-indigo-900/50 dark:text-white dark:ring-indigo-600/50'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-200/50 text-xs font-bold text-indigo-900 dark:bg-indigo-800 dark:text-indigo-100">
                      {em.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{em.name}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {em.designation} · {em.employeeId}
                      </span>
                    </span>
                  </button>
                </div>
              );
            }

            const e = row.entry;
            const showGroup = lastGroup !== e.group;
            if (showGroup) lastGroup = e.group;

            return (
              <div key={e.path} className="mb-0.5">
                {showGroup && (
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {e.group}
                  </p>
                )}
                <button
                  type="button"
                  data-palette-row={i}
                  onClick={() => goNav(e)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                    idx === i
                      ? 'bg-indigo-100 text-indigo-950 ring-1 ring-indigo-300/60 dark:bg-indigo-900/50 dark:text-white dark:ring-indigo-600/50'
                      : location.pathname === e.path
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-medium">{e.label}</span>
                  <span className="shrink-0 font-mono text-[10px] text-slate-400">{e.path}</span>
                </button>
              </div>
            );
          })}

          <p className="mt-1 px-2 pb-1 text-center text-[10px] text-slate-400">
            <kbd className="rounded bg-slate-100 px-1 font-mono dark:bg-slate-800">↑</kbd>{' '}
            <kbd className="rounded bg-slate-100 px-1 font-mono dark:bg-slate-800">↓</kbd> navigate ·{' '}
            <kbd className="rounded bg-slate-100 px-1 font-mono dark:bg-slate-800">⏎</kbd> open
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
