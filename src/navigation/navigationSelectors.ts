import type {
  NavigationDestination,
  NavigationSection,
  NavigationSectionKey,
} from './navigationModel';
import { NAVIGATION_DESTINATIONS, NAVIGATION_SECTIONS } from './navigationModel';

const byOrder = <T extends { order: number }>(left: T, right: T) => left.order - right.order;

export function accessibleDestinations(
  destinations: readonly NavigationDestination[],
  canAccessPath: (path: string) => boolean,
  canAccessReportDomain: (domain: string) => boolean = () => false
): NavigationDestination[] {
  return destinations
    .filter(
      (destination) =>
        canAccessPath(destination.accessPath ?? destination.path) &&
        (!destination.reportDomain || canAccessReportDomain(destination.reportDomain))
    )
    .sort(byOrder);
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

const LEGACY_DESTINATIONS: Readonly<Record<string, string>> = {
  '/hr/people': '/admin/employees',
  '/hr/leave-settings': '/admin/leave-settings',
  '/hr/access': '/admin/access',
  '/workplace/performance': '/performance',
  '/payroll': '/payroll/payslips',
};

export function activeNavigationDestination(
  location: string,
  destinations: readonly NavigationDestination[] = NAVIGATION_DESTINATIONS
): NavigationDestination | null {
  const current = new URL(location, 'https://navigation.local');
  current.pathname = LEGACY_DESTINATIONS[current.pathname] ?? current.pathname;
  if (current.pathname === '/workplace/workflows' && !current.searchParams.has('domain')) {
    current.searchParams.set('domain', 'leave');
  }
  const matches = destinations.flatMap((destination) => {
    const target = new URL(destination.path, current.origin);
    if (current.pathname !== target.pathname && !current.pathname.startsWith(`${target.pathname}/`))
      return [];
    const query = [...target.searchParams.entries()];
    if (
      !query.every(
        ([key, value]) =>
          current.searchParams.getAll(key).length === 1 && current.searchParams.get(key) === value
      )
    )
      return [];
    // A contextual report must not also select the unfiltered All Reports entry.
    if (
      target.pathname === '/admin/reports' &&
      current.searchParams.has('domain') &&
      !target.searchParams.has('domain')
    )
      return [];
    return [{ destination, specificity: target.pathname.length * 100 + query.length }];
  });
  matches.sort((left, right) => right.specificity - left.specificity);
  return matches[0]?.destination ?? null;
}

export function activeNavigationSection(
  location: string,
  destinations: readonly NavigationDestination[] = NAVIGATION_DESTINATIONS
): NavigationSectionKey | null {
  return activeNavigationDestination(location, destinations)?.section ?? null;
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
