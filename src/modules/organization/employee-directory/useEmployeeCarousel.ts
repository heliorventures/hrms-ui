import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';

import type { DirectoryEmployee } from './employeeDirectoryModel';

const reducedMotion = () =>
  document.querySelector('[data-motion="reduced"]') !== null ||
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const useEmployeeCarousel = (rows: readonly DirectoryEmployee[]) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState({ start: 1, end: 1, previous: false, next: false });
  const rowKey = rows.map((row) => row.employeeId).join('|');
  const measure = useCallback(() => {
    const strip = stripRef.current;
    if (!strip || !strip.clientWidth) return;
    const viewport = strip.getBoundingClientRect();
    const fullyVisible = Array.from(strip.children).flatMap((card, index) => {
      const bounds = card.getBoundingClientRect();
      return bounds.left >= viewport.left - 1 && bounds.right <= viewport.right + 1 ? [index] : [];
    });
    const start = fullyVisible[0] ?? 0;
    setRange({
      start: start + 1,
      end: (fullyVisible[fullyVisible.length - 1] ?? start) + 1,
      previous: strip.scrollLeft > 1,
      next: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1,
    });
  }, []);
  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return undefined;
    strip.scrollLeft = 0;
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(strip);
    strip.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      strip.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure, rowKey]);
  const move = (direction: number) => {
    const strip = stripRef.current;
    const card = strip?.firstElementChild;
    if (!strip || !card) return;
    const gap = Number.parseFloat(window.getComputedStyle(strip).columnGap) || 0;
    const width = card.getBoundingClientRect().width + gap;
    const count = Math.max(1, Math.floor(strip.clientWidth / width));
    strip.scrollBy({
      left: direction * width * count,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  };
  const focusCard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const offsets: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: rows.length - 1,
    };
    const target = offsets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const card = stripRef.current?.children[Math.max(0, Math.min(target, rows.length - 1))];
    if (card instanceof HTMLElement) card.focus();
  };
  return { stripRef, range, move, focusCard };
};
