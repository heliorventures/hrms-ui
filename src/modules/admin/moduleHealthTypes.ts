import type { DocumentNode } from 'graphql';

export interface ProbeConfig {
  key: string;
  label: string;
  plane: 'client' | 'operator';
  query: DocumentNode;
  previewFields: string[];
}

export type ProbeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; count: number; sample: string }
  | { status: 'error'; message: string };
