import type {
  NavigationDestination,
  NavigationSection,
  NavigationSectionKey,
} from './navigationModel';
import { NAVIGATION_SECTIONS } from './navigationModel';

const byOrder = <T extends { order: number }>(left: T, right: T) => left.order - right.order;

export function accessibleDestinations(
  destinations: readonly NavigationDestination[],
  canAccessPath: (path: string) => boolean
): NavigationDestination[] {
  return destinations.filter((destination) => canAccessPath(destination.path)).sort(byOrder);
}

export function filterNavigationDestinations(
  destinations: readonly NavigationDestination[],
  query: string,
  sections: readonly NavigationSection[] = NAVIGATION_SECTIONS
): NavigationDestination[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...destinations].sort(byOrder);

  const sectionLabels = new Map(sections.map((section) => [section.key, section.label]));
  return destinations
    .filter((destination) => {
      const sectionLabel = destination.section
        ? (sectionLabels.get(destination.section) ?? '')
        : '';
      const searchable = [
        destination.label,
        destination.path,
        sectionLabel,
        ...destination.keywords,
      ]
        .join(' ')
        .toLowerCase();
      return words.every((word) => searchable.includes(word));
    })
    .sort(byOrder);
}

export function activeNavigationSection(
  pathname: string,
  sections: readonly NavigationSection[] = NAVIGATION_SECTIONS
): NavigationSectionKey | null {
  const matches = sections
    .filter(
      (section) => pathname === section.basePath || pathname.startsWith(`${section.basePath}/`)
    )
    .sort((left, right) => right.basePath.length - left.basePath.length);
  return matches[0]?.key ?? null;
}

export interface NavigationGroup {
  section: NavigationSection;
  destinations: NavigationDestination[];
}

export function groupNavigationDestinations(
  destinations: readonly NavigationDestination[],
  sections: readonly NavigationSection[] = NAVIGATION_SECTIONS
): NavigationGroup[] {
  return [...sections]
    .sort(byOrder)
    .map((section) => ({
      section,
      destinations: destinations
        .filter(
          (destination) => destination.section === section.key && destination.sidebar === 'section'
        )
        .sort(byOrder),
    }))
    .filter((group) => group.destinations.length > 0);
}
