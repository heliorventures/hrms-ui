export type OverlayEntry = {
  id: symbol;
  focus: () => void;
  surface: () => HTMLElement | null;
};

const overlayStack: OverlayEntry[] = [];
const surfaceStates = new Map<symbol, {
  ariaHidden: string | null;
  inert: boolean;
  surface: HTMLElement;
}>();
const backgroundStates = new Map<HTMLElement, {
  ariaHidden: string | null;
  inert: boolean;
}>();
const ROOT_ID = 'root';

let bodyOverflowBeforeFirstOverlay: string | null = null;
let rootInertBeforeFirstOverlay = false;
let rootWasIsolated = false;

const setRootInert = (rootInert: boolean) => {
  const root = document.getElementById(ROOT_ID);
  if (!root) return;
  root.toggleAttribute('inert', rootInert);
};

const isolateElement = (element: HTMLElement) => {
  if (!backgroundStates.has(element)) {
    backgroundStates.set(element, {
      ariaHidden: element.getAttribute('aria-hidden'),
      inert: element.hasAttribute('inert'),
    });
  }
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute('inert', '');
};

const isolateBackground = (surface: HTMLElement | null) => {
  const root = document.getElementById(ROOT_ID);
  if (!root || !surface || !root.contains(surface)) {
    rootWasIsolated = true;
    setRootInert(true);
    return;
  }

  rootWasIsolated = false;
  let current: HTMLElement = surface;
  while (current !== root) {
    const parent = current.parentElement;
    if (!parent) break;
    for (const sibling of Array.from(parent.children)) {
      if (!(sibling instanceof HTMLElement)) continue;
      if (sibling === current || sibling.hasAttribute('data-overlay-background-exempt')) continue;
      isolateElement(sibling);
    }
    current = parent;
  }
};

const restoreBackground = () => {
  for (const [element, state] of backgroundStates) {
    element.toggleAttribute('inert', state.inert);
    if (state.ariaHidden === null) element.removeAttribute('aria-hidden');
    else element.setAttribute('aria-hidden', state.ariaHidden);
  }
  backgroundStates.clear();
};

const restoreSurface = (id: symbol) => {
  const state = surfaceStates.get(id);
  if (!state) return;
  state.surface.toggleAttribute('inert', state.inert);
  if (state.ariaHidden === null) state.surface.removeAttribute('aria-hidden');
  else state.surface.setAttribute('aria-hidden', state.ariaHidden);
};

const syncOverlayModality = () => {
  const topId = topOverlay()?.id;
  for (const entry of overlayStack) {
    const state = surfaceStates.get(entry.id);
    if (!state) continue;
    if (entry.id === topId) restoreSurface(entry.id);
    else {
      state.surface.setAttribute('inert', '');
      state.surface.setAttribute('aria-hidden', 'true');
    }
  }
};

export const topOverlay = () => overlayStack[overlayStack.length - 1];

export const isTopmostOverlay = (id: symbol) => topOverlay()?.id === id;

export const focusTopOverlay = () => topOverlay()?.focus();

export const registerOverlay = (entry: OverlayEntry) => {
  if (overlayStack.length === 0) {
    bodyOverflowBeforeFirstOverlay = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const root = document.getElementById(ROOT_ID);
    rootInertBeforeFirstOverlay = root?.hasAttribute('inert') ?? false;
    isolateBackground(entry.surface());
  }

  const surface = entry.surface();
  if (surface) {
    surfaceStates.set(entry.id, {
      ariaHidden: surface.getAttribute('aria-hidden'),
      inert: surface.hasAttribute('inert'),
      surface,
    });
  }

  overlayStack.push(entry);
  overlayStack.sort((left, right) => {
    const leftSurface = left.surface();
    const rightSurface = right.surface();
    if (!leftSurface || !rightSurface) return 0;
    const position = leftSurface.compareDocumentPosition(rightSurface);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
  syncOverlayModality();
};

export const unregisterOverlay = (id: symbol) => {
  const index = overlayStack.findIndex((entry) => entry.id === id);
  if (index === -1) return false;

  const wasTopmost = index === overlayStack.length - 1;
  restoreSurface(id);
  surfaceStates.delete(id);
  overlayStack.splice(index, 1);

  if (overlayStack.length > 0) {
    syncOverlayModality();
    return wasTopmost;
  }

  document.body.style.overflow = bodyOverflowBeforeFirstOverlay ?? '';
  bodyOverflowBeforeFirstOverlay = null;

  restoreBackground();
  if (rootWasIsolated) setRootInert(rootInertBeforeFirstOverlay);
  rootInertBeforeFirstOverlay = false;
  rootWasIsolated = false;

  return wasTopmost;
};

export const getOverlayCount = () => overlayStack.length;
