import { useSearchParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

import { useVideoGuides } from './useVideoGuides';
import VideoGuidePlayer from './VideoGuidePlayer';
import VideoGuideResults from './VideoGuideResults';

const VideoLibrary = () => {
  const { state, reload } = useVideoGuides();
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const feature = params.get('feature') ?? '';
  const videos = state.phase === 'ready' ? state.catalog.videos : [];
  const features = [...new Set(videos.map((video) => video.feature))].sort();
  const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = videos.filter((video) => {
    const content = [video.title, video.feature, video.description, ...video.keywords]
      .join(' ')
      .toLocaleLowerCase();
    return (!feature || video.feature === feature) && terms.every((term) => content.includes(term));
  });
  const selected = videos.find((video) => video.id === params.get('video'));
  const update = (name: string, value: string, replace = false) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace, preventScrollReset: true });
  };
  const clear = () => {
    const next = new URLSearchParams(params);
    next.delete('q');
    next.delete('feature');
    setParams(next, { replace: true });
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
        <Input
          type="search"
          label="Search videos"
          placeholder="Try punch in, leave approval, payslip…"
          value={search}
          onChange={(event) => update('q', event.target.value, true)}
          fullWidth
        />
        <Select
          label="Feature"
          value={feature}
          onChange={(event) => update('feature', event.target.value)}
          options={[
            { value: '', label: 'All features' },
            ...features.map((name) => ({ value: name, label: name })),
          ]}
          fullWidth
        />
      </div>
      {state.phase === 'loading' ? <p role="status">Loading video guides…</p> : null}
      {state.phase === 'error' ? (
        <section role="alert" className="space-y-3 rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Video guides could not be loaded</h2>
          <p className="text-sm text-content-secondary">Please try again in a moment.</p>
          <Button variant="secondary" onClick={reload}>
            Try again
          </Button>
        </section>
      ) : null}
      {selected ? <VideoGuidePlayer key={selected.id} video={selected} /> : null}
      {state.phase === 'ready' ? (
        <VideoGuideResults
          matches={matches}
          selectedId={selected?.id}
          unavailable={Boolean(params.get('video')) && !selected}
          onSelect={(id) => update('video', id)}
          onClear={clear}
        />
      ) : null}
    </>
  );
};

export default VideoLibrary;
