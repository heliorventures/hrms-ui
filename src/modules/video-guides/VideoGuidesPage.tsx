import { Link } from 'react-router-dom';

import AppLogo from '../../components/brand/AppLogo';

import VideoLibrary from './VideoLibrary';

const VideoGuidesPage = () => (
  <main className="min-h-screen bg-canvas text-content-primary">
    <div className="mx-auto max-w-6xl space-y-7 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/" aria-label="Helior HRMS home">
          <AppLogo size="sm" />
        </Link>
        <Link to="/" className="text-sm font-medium text-content-secondary hover:underline">
          Back to home
        </Link>
      </header>
      <section aria-labelledby="library-title">
        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
          LEARN HELIOR HRMS
        </p>
        <h1 id="library-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Video guides
        </h1>
        <p className="mt-3 max-w-2xl text-content-secondary">
          Find a feature and follow the highlighted steps. Every guide takes a minute or less.
        </p>
      </section>
      <VideoLibrary />
      <footer className="border-t border-line pt-5 text-sm text-content-muted">
        English captions · Demo recordings · Sample figures and simulated GPS are labeled in the
        videos.
      </footer>
    </div>
  </main>
);

export default VideoGuidesPage;
