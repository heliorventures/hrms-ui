import type { LoanConnection } from './loanTypes';

/** Return only a complete result; a failed page must never become a partial financial export. */
export async function allLoanPages<T>(load: (after: string | null) => Promise<LoanConnection<T>>) {
  const nodes: T[] = [];
  const seen = new Set<string>();
  let after: string | null = null;
  for (;;) {
    const page: LoanConnection<T> = await load(after);
    nodes.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) return nodes;
    const cursor: string | null | undefined = page.pageInfo.endCursor;
    if (!cursor || seen.has(cursor))
      throw new Error('The financial records could not be loaded completely. Refresh and retry.');
    seen.add(cursor);
    after = cursor;
  }
}
