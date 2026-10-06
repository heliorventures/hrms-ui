import { safeFeaturePath } from './featureAccess';
import type { FeatureAccessContext } from './featureTypes';
import type { TourStep } from './tourTypes';

const dirtyForms = new WeakSet<Element>();
const formVersions = new WeakMap<Element, number>();
let watching = false;
/** Track form changes without reading or storing field values. Successful unmount clears ownership. */
export const watchGuidanceForms = () => {
  if (watching || typeof document === 'undefined') return;
  watching = true;
  const mark = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const form = event.target.closest('form');
    if (form && form.dataset.guidanceReadOnly !== 'true') {
      dirtyForms.add(form);
      formVersions.set(form, (formVersions.get(form) ?? 0) + 1);
    }
  };
  document.addEventListener('input', mark, true);
  document.addEventListener('change', mark, true);
  document.addEventListener(
    'reset',
    (event) => {
      if (event.target instanceof Element) dirtyForms.delete(event.target);
    },
    true
  );
};
/** Invoke after a successful save; preserve edits made while that save was in flight. */
export const captureGuidanceFormSave = (target: EventTarget | null) => {
  const form = target instanceof HTMLFormElement ? target : null;
  const version = form ? formVersions.get(form) : undefined;
  return () => {
    if (form && form.isConnected && formVersions.get(form) === version) dirtyForms.delete(form);
  };
};
export const guidanceNavigationBlocked = () => {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.querySelector('[data-guidance-dirty="true"], [role="dialog"] form') ||
    [...document.querySelectorAll('form')].some((form) => dirtyForms.has(form))
  );
};
export const resolveTourDestination = (
  step: TourStep,
  context: FeatureAccessContext
): string | null => {
  const destination = step.destination;
  if (
    !destination ||
    !safeFeaturePath(destination.path) ||
    !context.canAccessPath(destination.path)
  )
    return null;
  if (
    destination.tabId &&
    !context.allowedTabIds(context.routePath ?? '')?.includes(destination.tabId)
  )
    return null;
  if (
    !(step.isVisible?.({ ...context, activeTab: destination.tabId ?? context.activeTab }) ?? true)
  )
    return null;
  return destination.path;
};
export const navigateTourStep = (
  step: TourStep,
  context: FeatureAccessContext,
  navigate: (path: string) => void,
  confirmed = false
) => {
  const path = resolveTourDestination(step, context);
  if (!path || (!confirmed && path !== context.currentPath && guidanceNavigationBlocked()))
    return { status: 'blocked' as const };
  navigate(path);
  return { status: 'ready' as const };
};
export const focusFeatureAnchor = (anchor: string, stillCurrent: () => boolean) => {
  let attempts = 0;
  const find = () => {
    if (!stillCurrent()) return;
    const target = [...document.querySelectorAll<HTMLElement>('[data-tour-anchor]')].find(
      (node) =>
        node.dataset.tourAnchor === anchor &&
        !node.closest('[hidden],[aria-hidden="true"]') &&
        ![node, ...ancestors(node)].some((element) => {
          const style = getComputedStyle(element);
          return style.display === 'none' || style.visibility === 'hidden';
        })
    );
    if (target) {
      target.scrollIntoView?.({ block: 'nearest' });
      const previous = target.getAttribute('tabindex');
      if (previous === null) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (previous === null)
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      return;
    }
    if (++attempts < 40) setTimeout(find, 50);
  };
  setTimeout(find, 0);
};
const ancestors = (element: Element): Element[] => {
  const parents: Element[] = [];
  let parent = element.parentElement;
  while (parent) {
    parents.push(parent);
    parent = parent.parentElement;
  }
  return parents;
};
