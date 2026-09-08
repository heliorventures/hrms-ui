import type { MutableRefObject } from 'react';

import type { useGraphClient } from '../../../hooks/useGraphClient';

import type { PrejoiningCandidate } from './prejoiningAdminTypes';
import type { usePrejoiningAdminState } from './usePrejoiningAdminState';

export type PrejoiningActionContext = {
  state: ReturnType<typeof usePrejoiningAdminState>;
  client: ReturnType<typeof useGraphClient>;
  ownerRef: MutableRefObject<symbol>;
  ownerToken: symbol;
  runAction: (key: string, operation: () => Promise<void>) => Promise<void>;
  applyCandidate: (next: PrejoiningCandidate) => void;
};
