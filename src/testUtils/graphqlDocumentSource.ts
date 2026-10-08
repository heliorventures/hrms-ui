import { Kind, print, type DocumentNode } from 'graphql';

/** Let existing request mocks inspect both generated documents and string fixtures. */
export function graphqlDocumentSource(document: unknown): string {
  if (typeof document === 'string') return document;
  if (
    document === null ||
    typeof document !== 'object' ||
    !('kind' in document) ||
    document.kind !== Kind.DOCUMENT ||
    !('definitions' in document) ||
    !Array.isArray(document.definitions)
  ) {
    throw new TypeError('Expected a GraphQL document in the request mock.');
  }
  return print(document as DocumentNode);
}
