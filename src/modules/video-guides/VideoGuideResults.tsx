import Button from '../../components/common/Button';

import type { VideoGuide } from './catalog.mjs';
import VideoGuideCard from './VideoGuideCard';

interface ResultsProps {
  matches: VideoGuide[];
  selectedId?: string;
  unavailable: boolean;
  onSelect: (id: string) => void;
  onClear: () => void;
}

const VideoGuideResults = ({
  matches,
  selectedId,
  unavailable,
  onSelect,
  onClear,
}: ResultsProps) => (
  <section aria-label="Video library" className="space-y-4">
    <p role="status" className="text-sm text-content-secondary">
      {matches.length} {matches.length === 1 ? 'video' : 'videos'} found
    </p>
    {unavailable ? (
      <p role="status">The linked video is no longer available. Choose another guide below.</p>
    ) : null}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((video) => (
        <VideoGuideCard
          key={video.id}
          video={video}
          selected={selectedId === video.id}
          onSelect={() => onSelect(video.id)}
        />
      ))}
    </div>
    {matches.length === 0 ? (
      <div className="space-y-3 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-semibold">No matching videos</h2>
        <p className="text-sm text-content-secondary">Try another feature or a shorter search.</p>
        <Button variant="secondary" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    ) : null}
  </section>
);

export default VideoGuideResults;
