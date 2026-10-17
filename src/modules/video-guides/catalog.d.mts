export interface VideoGuide {
  id: string;
  title: string;
  feature: string;
  description: string;
  keywords: string[];
  durationSeconds: number;
  src: string;
  poster?: string;
  disclosure: 'demo' | 'sample-payroll' | 'simulated-gps';
  updatedAt: string;
}

export interface VideoGuideCatalog {
  schemaVersion: 1;
  updatedAt: string;
  videos: VideoGuide[];
}

export function parseVideoGuideCatalog(value: unknown): VideoGuideCatalog;
