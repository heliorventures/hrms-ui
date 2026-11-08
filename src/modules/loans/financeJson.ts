export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Financial information is incomplete. Refresh the review.');
  return value as Record<string, unknown>;
}
export function text(value: unknown): string {
  if (typeof value !== 'string') throw new Error('A financial reference or amount is unavailable.');
  return value;
}
export function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value))
    throw new Error('Financial precision or revision is unavailable.');
  return value;
}
export function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Financial records are unavailable.');
  return value;
}
export function flag(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new Error('A financial policy selection is unavailable.');
  return value;
}
