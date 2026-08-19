import { ChevronDown } from 'lucide-react';

import type { NavigationDestination, NavigationSection } from '../../navigation/navigationModel';

import SidebarDestination from './SidebarDestination';

interface SidebarSectionProps {
  section: NavigationSection;
  destinations: NavigationDestination[];
  expanded: boolean;
  compact: boolean;
  onToggle: () => void;
  onRequestExpand: () => void;
  onNavigate: () => void;
}

const SidebarSection = ({
  section,
  destinations,
  expanded,
  compact,
  onToggle,
  onRequestExpand,
  onNavigate,
}: SidebarSectionProps) => {
  const Icon = section.icon;
  const contentId = `navigation-section-${section.key}`;

  const handleToggle = () => {
    if (compact) onRequestExpand();
    onToggle();
  };

  return (
    <section className="pt-2" aria-labelledby={`${contentId}-label`}>
      <button
        id={`${contentId}-label`}
        type="button"
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-controls={contentId}
        title={compact ? section.label : undefined}
        className={[
          'mx-1 flex w-[calc(100%-0.5rem)] items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
          compact ? 'lg:justify-center lg:px-2' : '',
          expanded
            ? 'bg-slate-200/60 font-semibold text-slate-950 dark:bg-slate-800 dark:text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white',
        ].join(' ')}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          <span className={compact ? 'lg:sr-only' : undefined}>{section.label}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none ${
            expanded ? 'rotate-180' : ''
          } ${compact ? 'lg:hidden' : ''}`}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div
          id={contentId}
          className={`ml-2 mt-1 space-y-0.5 border-l border-slate-200/90 pl-2 dark:border-slate-700 ${
            compact ? 'lg:hidden' : ''
          }`}
        >
          {destinations.map((destination) => (
            <SidebarDestination
              key={destination.path}
              destination={destination}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default SidebarSection;
