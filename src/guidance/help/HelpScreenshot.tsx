import { useState } from 'react';

import Modal from '../../components/common/Modal';

import type { HelpScreenshotDefinition } from './helpTypes';
import manifest from './screenshotManifest.json';

const screenshots = manifest as readonly HelpScreenshotDefinition[];
const HelpScreenshot = ({ id }: { id: string }) => {
  const [expanded, setExpanded] = useState(false);
  const screenshot = screenshots.find((item) => item.id === id);
  if (!screenshot) return <p role="status">Screenshot capture is pending for this feature.</p>;
  return (
    <figure className="my-3 space-y-2">
      <button
        type="button"
        className="block w-full rounded-md focus-visible:ring-2 focus-visible:ring-focus"
        aria-label={`Enlarge ${screenshot.alt}`}
        onClick={() => setExpanded(true)}
      >
        <img
          src={screenshot.src}
          alt={screenshot.alt}
          loading="lazy"
          className="h-auto w-full rounded-md border border-line"
        />
      </button>
      <figcaption className="text-xs text-content-muted">{screenshot.caption}</figcaption>
      <Modal isOpen={expanded} onClose={() => setExpanded(false)} title={screenshot.alt} size="xl">
        <img src={screenshot.src} alt={screenshot.alt} className="h-auto w-full" />
        <p className="mt-2 text-sm">{screenshot.caption}</p>
      </Modal>
    </figure>
  );
};
export default HelpScreenshot;
