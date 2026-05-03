const TASK_PREFIX = /^\[task:([^\]]+)\]\s*(.*)$/s;

export function encodeTimesheetDescription(taskCode: string, notes: string): string | null {
  const n = notes.trim();
  const t = taskCode.trim();
  if (t && n) return `[task:${t}] ${n}`;
  if (t) return `[task:${t}]`;
  if (n) return n;
  return null;
}

export function decodeTimesheetDescription(desc: string | null | undefined): {
  task: string;
  notes: string;
} {
  if (!desc) return { task: '', notes: '' };
  const m = desc.match(TASK_PREFIX);
  if (!m) return { task: '', notes: desc };
  return { task: m[1], notes: (m[2] ?? '').trim() };
}
