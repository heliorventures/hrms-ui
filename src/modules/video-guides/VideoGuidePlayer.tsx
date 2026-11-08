/* Guides are silent demonstrations with captions burned into the video. */
/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef, useState } from 'react';

import Button from '../../components/common/Button';

import type { VideoGuide } from './catalog.mjs';

const DISCLOSURES = {
  demo: 'Recorded on the demo site',
  'sample-payroll': 'Illustrative payroll figures',
  'simulated-gps': 'Demo recording with simulated GPS',
};

const VideoGuidePlayer = ({ video }: { video: VideoGuide }) => {
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: 'nearest' });
  }, []);
  const copyLink = async () => {
    const url = new URL('/hrms-demos', window.location.origin);
    url.searchParams.set('video', video.id);
    try {
      await navigator.clipboard.writeText(url.href);
      setMessage('Video link copied.');
    } catch {
      setMessage('Copy the page address from your browser to share this video.');
    }
  };

  return (
    <section
      aria-labelledby="video-player-title"
      className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-content-secondary">{video.feature}</p>
          <h2
            ref={heading}
            tabIndex={-1}
            id="video-player-title"
            className="mt-1 text-xl font-semibold"
          >
            {video.title}
          </h2>
          <p className="mt-2 text-sm text-content-secondary">{video.description}</p>
        </div>
        <Button variant="secondary" onClick={() => void copyLink()}>
          Copy video link
        </Button>
      </div>
      <video
        key={video.src}
        controls
        playsInline
        preload="none"
        poster={video.poster}
        aria-label={video.title}
        onError={() => setFailed(true)}
        className="aspect-video max-h-[65vh] w-full rounded-xl bg-slate-950"
      >
        <source src={video.src} type="video/mp4" />
        Your browser does not support video playback.
      </video>
      {failed ? (
        <p role="alert" className="mt-3 text-sm text-status-danger">
          This video could not be loaded. Please refresh or try again later.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm text-content-muted">
        <span>
          {DISCLOSURES[video.disclosure]} · {Math.ceil(video.durationSeconds)} seconds
        </span>
        <span role="status">{message}</span>
      </div>
    </section>
  );
};

export default VideoGuidePlayer;
