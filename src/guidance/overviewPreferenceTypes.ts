export type OverviewReadState =
  | { status: 'loading' }
  | { status: 'ready'; dismissedAt: Date | null }
  | { status: 'error' };

export type PreferenceErrorOperation = 'read' | 'dismiss';
