import { useEffect, useState } from 'react';

import type { TourTargetRect } from './tourGeometry';

function findVisibleAnchor(anchor: string | null): HTMLElement | null {
  if (!anchor || typeof document === 'undefined') return null;
  const browserHasLayout = document.documentElement.getClientRects().length > 0;
  return (
    Array.from(document.querySelectorAll<HTMLElement>('[data-tour-anchor]')).find((candidate) => {
      if (
        candidate.getAttribute('data-tour-anchor') !== anchor ||
        candidate.closest('[hidden], [aria-hidden="true"]')
      ) {
        return false;
      }
      for (let current: HTMLElement | null = candidate; current; current = current.parentElement) {
        const style = window.getComputedStyle(current);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.visibility === 'collapse'
        ) {
          return false;
        }
      }
      return !browserHasLayout || candidate.getClientRects().length > 0;
    }) ?? null
  );
}

function rectFor(target: HTMLElement): TourTargetRect {
  const rect = target.getBoundingClientRect();
  return {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
  };
}

function sameRect(left: TourTargetRect | null, right: TourTargetRect): boolean {
  return Boolean(
    left &&
    left.bottom === right.bottom &&
    left.height === right.height &&
    left.left === right.left &&
    left.right === right.right &&
    left.top === right.top &&
    left.width === right.width
  );
}

export function useTourAnchor(anchor: string | null, reducedMotion: boolean) {
  const [anchorState, setAnchorState] = useState<{
    anchor: string | null;
    rect: TourTargetRect | null;
  } | null>(null);

  useEffect(() => {
    let observedTarget: HTMLElement | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const update = () => {
      const target = findVisibleAnchor(anchor);
      if (target !== observedTarget) {
        if (observedTarget) resizeObserver?.unobserve(observedTarget);
        observedTarget = target;
        if (target) {
          resizeObserver?.observe(target);
          target.scrollIntoView?.({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'nearest',
          });
        }
      }
      if (!target) {
        setAnchorState((current) =>
          current && current.anchor === anchor && current.rect === null
            ? current
            : { anchor, rect: null }
        );
        return;
      }
      const nextRect = rectFor(target);
      setAnchorState((current) =>
        current && current.anchor === anchor && sameRect(current.rect, nextRect)
          ? current
          : { anchor, rect: nextRect }
      );
    };
    resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    const onResize = () => update();
    update();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', update, { passive: true, capture: true });

    const observer = new MutationObserver(update);
    const observedRoot = document.getElementById('root');
    if (observedRoot) {
      observer.observe(observedRoot, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-hidden', 'class', 'data-tour-anchor', 'hidden', 'style'],
      });
    }

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', update, true);
      observer.disconnect();
      resizeObserver?.disconnect();
    };
  }, [anchor, reducedMotion]);

  return anchorState?.anchor === anchor ? anchorState.rect : null;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  return reduced;
}
