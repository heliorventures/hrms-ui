import { useCallback, useContext, useLayoutEffect, useRef } from 'react';
import { UNSAFE_NavigationContext, useSearchParams } from 'react-router-dom';

type View = Record<string, string>;
// Only non-sensitive navigation values belong here. React Router's navigator
// survives page remounts (page-local GraphQL clients do not). Localize the v6
// navigation-context dependency here; authorization changes clear all views.
const remembered = new WeakMap<object, { identity: string; views: Map<string, View> }>();
interface Entry<T> {
  owner: object;
  identity: string;
  initial: T;
  resetting: boolean;
}

function resolveEntry<T extends View>(
  navigator: object,
  owner: object,
  identity: string,
  key: string,
  defaults: T,
  current?: Entry<T>
): Entry<T> {
  const cache = remembered.get(navigator);
  const changed =
    (current && current.identity !== identity) || (cache && cache.identity !== identity);
  if (current && !changed) return current;
  if (changed) remembered.delete(navigator);
  const initial = !changed && cache?.identity === identity ? cache.views.get(key) : undefined;
  return { owner, identity, initial: (initial ?? defaults) as T, resetting: Boolean(changed) };
}

export function boundedInteger(value: string | null, fallback: number, min: number, max: number) {
  if (value === null || !/^\d+$/.test(value)) return fallback;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= min && number <= max ? number : fallback;
}

export function useRememberedRouteView<T extends View>(
  owner: object,
  identity: string,
  key: string,
  defaults: T,
  normalize: (params: URLSearchParams) => T
): [T, (change: Partial<T> | ((current: T) => Partial<T>)) => void] {
  const [params, setParams] = useSearchParams();
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const entry = useRef<Entry<T>>();
  entry.current = resolveEntry(navigator, owner, identity, key, defaults, entry.current);
  const keys = Object.keys(defaults);
  const hasView = keys.some((name) => params.has(name));
  let source: T | URLSearchParams = entry.current.initial;
  if (hasView) source = params;
  if (entry.current.resetting) source = defaults;
  const value = normalize(source instanceof URLSearchParams ? source : new URLSearchParams(source));
  const serialized = JSON.stringify(value);
  const search = params.toString();

  useLayoutEffect(() => {
    let cache = remembered.get(navigator);
    if (!cache || cache.identity !== identity) {
      cache = { identity, views: new Map() };
      remembered.set(navigator, cache);
    }
    const canonical = JSON.parse(serialized) as T;
    cache.views.set(key, canonical);
    if (entry.current) entry.current.resetting = false;
    const next = new URLSearchParams(search);
    for (const [name, content] of Object.entries(canonical)) next.set(name, content);
    if (next.toString() !== search) setParams(next, { replace: true });
  }, [identity, key, navigator, search, serialized, setParams]);

  const update = useCallback(
    (change: Partial<T> | ((current: T) => Partial<T>)) => {
      const current = JSON.parse(serialized) as T;
      const nextValue = {
        ...current,
        ...(typeof change === 'function' ? change(current) : change),
      };
      setParams((existing) => {
        const next = new URLSearchParams(existing);
        for (const [name, content] of Object.entries(nextValue)) next.set(name, content);
        return next;
      });
    },
    [serialized, setParams]
  );
  return [value, update];
}
