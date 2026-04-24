import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Employee } from '../../types';

interface SearchPage {
  path: string;
  label: string;
  keywords: string[];
}

const SEARCH_PAGES: SearchPage[] = [
  { path: '/dashboard', label: 'Dashboard', keywords: ['dashboard', 'home'] },
  { path: '/attendance', label: 'Attendance', keywords: ['attendance', 'timesheet', 'punch'] },
  { path: '/leave', label: 'Leave', keywords: ['leave', 'holiday'] },
  { path: '/payroll', label: 'Payroll', keywords: ['payroll', 'payslip', 'salary'] },
  { path: '/expenses', label: 'Expenses', keywords: ['expenses', 'travel', 'reimbursement'] },
  { path: '/notifications', label: 'Notifications', keywords: ['notifications', 'alerts'] },
  {
    path: '/organization/org-chart',
    label: 'Org chart',
    keywords: ['org chart', 'hierarchy', 'reporting', 'manager'],
  },
  {
    path: '/organization/employees',
    label: 'Organization – Employees',
    keywords: ['organization', 'employees', 'people'],
  },
  {
    path: '/organization/documents',
    label: 'Organization – Documents',
    keywords: ['organization', 'documents', 'policies'],
  },
  {
    path: '/admin/employees',
    label: 'Admin – Employees',
    keywords: ['admin', 'employees', 'manage'],
  },
  { path: '/admin/reports', label: 'Admin – Reports', keywords: ['admin', 'reports', 'analytics'] },
  { path: '/profile/settings', label: 'Profile Settings', keywords: ['profile', 'settings'] },
];

const GlobalSearch = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matchingPages = useMemo(() => {
    if (!query.trim()) return SEARCH_PAGES.slice(0, 6);
    const q = query.trim().toLowerCase();
    return SEARCH_PAGES.filter(
      (p) =>
        p.label.toLowerCase().includes(q) || p.keywords.some((k) => k.includes(q) || q.includes(k))
    );
  }, [query]);

  const matchingEmployees = useMemo((): Employee[] => [], []);

  const totalResults = matchingPages.length + matchingEmployees.length;
  const showDropdown = isOpen && (query.length > 0 || matchingPages.length > 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [query]);

  const handleSelectPage = (path: string) => {
    navigate(path);
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleSelectEmployee = (empId: string) => {
    navigate(`/organization/employees/${empId}`);
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => (i < totalResults - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => (i > 0 ? i - 1 : totalResults - 1));
      return;
    }
    if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      if (focusedIndex < matchingPages.length) {
        handleSelectPage(matchingPages[focusedIndex].path);
      } else {
        const empIndex = focusedIndex - matchingPages.length;
        const emp = matchingEmployees[empIndex];
        if (emp) handleSelectEmployee(emp.id);
      }
    }
  };

  if (role !== 'admin') return null;

  return (
    <div className="relative hidden md:block" ref={containerRef}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/70">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search employees or go to page..."
          className="w-64 rounded-lg border border-white/20 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 lg:w-72"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {matchingPages.length > 0 && (
            <div className="border-b border-gray-100 p-1 dark:border-gray-700">
              <p className="px-3 py-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Pages
              </p>
              {matchingPages.map((page, idx) => (
                <button
                  key={page.path}
                  type="button"
                  onClick={() => handleSelectPage(page.path)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                    location.pathname === page.path
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : focusedIndex === idx
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-gray-400 dark:text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </span>
                  {page.label}
                </button>
              ))}
            </div>
          )}
          {matchingEmployees.length > 0 && (
            <div className="p-1">
              <p className="px-3 py-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Employees
              </p>
              {matchingEmployees.map((emp, idx) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleSelectEmployee(emp.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                    focusedIndex === matchingPages.length + idx
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                    {emp.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{emp.name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {emp.designation} · {emp.department}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {query.trim() && matchingPages.length === 0 && matchingEmployees.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No results for &quot;{query}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
