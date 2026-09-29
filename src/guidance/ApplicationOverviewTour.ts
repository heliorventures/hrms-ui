import { NAVIGATION_SECTIONS, type NavigationDestination } from '../navigation/navigationModel';
import { groupNavigationDestinations } from '../navigation/navigationSelectors';

import type { TourDefinition } from './tourTypes';

/**
 * Creates a short overview from destinations already filtered by the user's
 * route permissions. Each step represents a section, not an individual page.
 */
export function createApplicationOverviewTour(
  destinations: readonly NavigationDestination[]
): TourDefinition {
  const steps: TourDefinition['steps'][number][] = [
    {
      id: 'overview-welcome',
      anchor: null,
      title: 'Welcome to your HRMS',
      body: 'Use the navigation to find your work, review information, and manage the tasks available to your role.',
    },
  ];

  const primaryDestinations = destinations.filter(
    (destination) => destination.sidebar === 'primary'
  );
  if (primaryDestinations.length > 0) {
    const labels = primaryDestinations.map((destination) => destination.label);
    steps.push({
      id: 'overview-primary',
      anchor: primaryDestinations.some((destination) => destination.path === '/dashboard')
        ? 'navigation-home'
        : null,
      title: labels.length === 1 ? labels[0] : 'Start here',
      body: `Open ${labels.join(', ')} for your home page and other main destinations.`,
    });
  }

  const groups = groupNavigationDestinations(destinations, NAVIGATION_SECTIONS);
  for (const group of groups) {
    const labels = group.destinations.map((destination) => destination.label);
    steps.push({
      id: `overview-${group.section.key}`,
      anchor: `navigation-section-${group.section.key}`,
      title: group.section.label,
      body: `This section includes ${labels.join(', ')}. Only pages available to your account are listed.`,
    });
  }

  const sectionedPaths = new Set(
    groups.flatMap((group) => group.destinations.map((destination) => destination.path))
  );
  const otherDestinations = destinations.filter(
    (destination) =>
      destination.sidebar !== 'primary' &&
      (!destination.section || !sectionedPaths.has(destination.path))
  );
  if (otherDestinations.length > 0) {
    steps.push({
      id: 'overview-other-pages',
      anchor: null,
      title: 'Other available pages',
      body: `You can also open ${otherDestinations.map((destination) => destination.label).join(', ')} from the navigation or page controls.`,
    });
  }

  return {
    id: 'application-overview',
    routePaths: [],
    steps,
  };
}
