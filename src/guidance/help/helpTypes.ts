export type HelpTaskDefinition = {
  id: string;
  featureId: string;
  title: string;
  prerequisites: readonly string[];
  steps: readonly { id: string; text: string; screenshotId?: string }[];
  requiredFields: readonly string[];
  afterSave: string;
  checkStatus: string;
  recovery: readonly string[];
};
export type HelpScreenshotDefinition = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  kind: 'design-illustration';
  source: string;
  nodeId: string;
  sha256: string;
  capturedAt: string;
};
export type HelpTaskContent = Omit<HelpTaskDefinition, 'id' | 'featureId' | 'title'>;
