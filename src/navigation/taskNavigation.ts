/** Retain unrelated filters when changing tasks within the same route. */
export function taskNavigationLocation(currentLocation: string, taskPath: string): string {
  const current = new URL(currentLocation, 'https://navigation.local');
  const target = new URL(taskPath, current.origin);
  if (current.pathname !== target.pathname) return taskPath;
  const params = new URLSearchParams(current.search);
  for (const key of ['tab', 'domain', 'workspace']) {
    if (!target.searchParams.has(key)) params.delete(key);
  }
  target.searchParams.forEach((value, key) => params.set(key, value));
  if (target.pathname === '/performance') params.delete('review');
  const search = params.toString();
  return `${target.pathname}${search ? `?${search}` : ''}${target.hash}`;
}
