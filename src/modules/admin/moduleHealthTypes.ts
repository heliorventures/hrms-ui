export interface ProbeConfig {
  key: string;
  label: string;
  plane: 'client' | 'operator';
  query: string;
  previewFields: string[];
}

export type ProbeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; count: number; sample: string }
  | { status: 'error'; message: string };
