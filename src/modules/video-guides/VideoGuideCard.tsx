import type { VideoGuide } from './catalog.mjs';

const VideoGuideCard = ({
  video,
  selected,
  onSelect,
}: {
  video: VideoGuide;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onSelect}
    className="group overflow-hidden rounded-xl border border-line bg-surface text-left shadow-sm transition hover:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
  >
    {video.poster ? (
      <img
        src={video.poster}
        alt=""
        loading="lazy"
        className="aspect-video w-full bg-slate-950 object-cover"
      />
    ) : (
      <div aria-hidden="true" className="aspect-video bg-slate-900" />
    )}
    <span className="block space-y-2 p-4">
      <span className="flex justify-between gap-2 text-xs font-medium text-content-secondary">
        <span>{video.feature}</span>
        <span>{Math.ceil(video.durationSeconds)}s</span>
      </span>
      <span className="block text-base font-semibold text-content-primary">{video.title}</span>
      <span className="block text-sm text-content-secondary">{video.description}</span>
      <span className="block text-sm font-medium text-primary-700 dark:text-primary-300">
        {selected ? 'Selected video' : 'Watch guide'}
      </span>
    </span>
  </button>
);

export default VideoGuideCard;
