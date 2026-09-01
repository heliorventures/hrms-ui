const MAIN_FOCUS_HANDOFF_KEY = '__heliorMainFocusHandoff';

export interface RouteContentCommit {
  locationKey: string;
  pathname: string;
}

export interface RouteContentOutletContext {
  onRouteContentCommit: (commit: RouteContentCommit) => void;
  onRouteStateCommit?: (commit: RouteContentCommit) => void;
}

export function createMainFocusHandoffState(state: unknown): Record<string, unknown> {
  const currentState =
    state !== null && typeof state === 'object' && !Array.isArray(state)
      ? (state as Record<string, unknown>)
      : {};
  return { ...currentState, [MAIN_FOCUS_HANDOFF_KEY]: true };
}

export function hasMainFocusHandoff(state: unknown): boolean {
  return Boolean(
    state !== null &&
      typeof state === 'object' &&
      (state as Record<string, unknown>)[MAIN_FOCUS_HANDOFF_KEY] === true
  );
}
