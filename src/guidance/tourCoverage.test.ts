import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import { TOUR_REGISTRY } from './tourRegistry';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const stableAnchorPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectPageSource(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['guidance', '__tests__', '__fixtures__'].includes(entry.name)) return [];
      const segments = relative(sourceRoot, path).split(sep);
      if (segments[0] === 'modules' && segments[1] === 'ops') return [];
      return collectPageSource(path);
    }
    if (!/\.tsx?$/.test(entry.name) || /\.(test|spec)\.[^.]+$/.test(entry.name)) return [];
    return [readFileSync(path, 'utf8')];
  });
}

function collectDeclaredAnchors(source: string): Set<string> {
  const anchors = new Set<string>();
  for (const match of source.matchAll(/data-tour-anchor\s*=\s*(?:"([^"]+)"|'([^']+)')/g)) {
    anchors.add(match[1] ?? match[2]);
  }

  for (const match of source.matchAll(/data-tour-anchor\s*=\s*\{(?!`)([\s\S]*?)\}/g)) {
    for (const value of match[1].matchAll(/['"]([^'"]+)['"]/g)) {
      anchors.add(value[1]);
    }
  }

  for (const match of source.matchAll(/data-tour-anchor\s*=\s*\{`([^`]+)`\}/g)) {
    const fragments = match[1].split(/\$\{[^}]+\}/g);
    const expressionPattern = new RegExp(`^${fragments.map(escapeRegExp).join('.+')}$`);
    for (const tour of TOUR_REGISTRY) {
      for (const step of tour.steps) {
        if (step.anchor && expressionPattern.test(step.anchor)) anchors.add(step.anchor);
      }
    }
  }

  // Shared controls forward these props from owning pages to their DOM anchors.
  for (const propName of ['tourAnchor', 'actionAnchor']) {
    const propPattern = new RegExp(`\\b${propName}\\s*=\\s*["']([^"']+)["']`, 'g');
    for (const match of source.matchAll(propPattern)) {
      anchors.add(match[1]);
    }
  }

  return anchors;
}

describe('tenant page tour registry coverage', () => {
  const tenantPagePaths = TENANT_APP_ROUTES.filter((route) => route.kind === 'page').map(
    (route) => route.path
  );
  const registeredPaths = TOUR_REGISTRY.flatMap((tour) => tour.routePaths);

  it('registers exactly one tour for every tenant page route', () => {
    const duplicatePaths = registeredPaths.filter(
      (path, index) => registeredPaths.indexOf(path) !== index
    );
    const duplicates = [...new Set(duplicatePaths)];
    const unknownPaths = [
      ...new Set(registeredPaths.filter((path) => !tenantPagePaths.includes(path))),
    ];
    const missingPaths = tenantPagePaths.filter((path) => !registeredPaths.includes(path));
    const duplicateRouteEntries = tenantPagePaths.filter(
      (path, index) => tenantPagePaths.indexOf(path) !== index
    );

    expect(duplicateRouteEntries, 'duplicate tenant page paths').toEqual([]);
    expect(duplicates, 'page paths registered by multiple tours').toEqual([]);
    expect(unknownPaths, 'tour paths absent from TENANT_APP_ROUTES').toEqual([]);
    expect(missingPaths, 'tenant page paths without a Help tour').toEqual([]);
    expect(registeredPaths).toHaveLength(tenantPagePaths.length);
  });

  it('uses stable, unique tour and step identifiers', () => {
    const tourIds = TOUR_REGISTRY.map((tour) => tour.id);
    expect(new Set(tourIds).size, 'duplicate tour IDs').toBe(tourIds.length);

    for (const tour of TOUR_REGISTRY) {
      expect(tour.id, `unstable tour ID: ${tour.id}`).toMatch(stableIdPattern);
      const stepIds = tour.steps.map((step) => step.id);
      expect(new Set(stepIds).size, `duplicate step IDs in ${tour.id}`).toBe(stepIds.length);

      for (const step of tour.steps) {
        expect(step.id, `unstable step ID in ${tour.id}: ${step.id}`).toMatch(stableIdPattern);
        if (step.anchor !== null) {
          expect(step.anchor, `unstable anchor in ${tour.id}/${step.id}`).toMatch(
            stableAnchorPattern
          );
        }
      }
    }
  });

  it('points every registered anchor at a real tenant UI source element', () => {
    const pageSources = collectPageSource(sourceRoot);
    for (const propName of ['tourAnchor', 'actionAnchor']) {
      expect(
        pageSources.some((source) => source.includes(`data-tour-anchor={${propName}}`)),
        `${propName} is not forwarded to a DOM anchor`
      ).toBe(true);
    }
    const declaredAnchors = new Set<string>(
      pageSources.flatMap((source) => [...collectDeclaredAnchors(source)])
    );
    const missingAnchors = TOUR_REGISTRY.flatMap((tour) =>
      tour.steps
        .filter((step) => step.anchor !== null && !declaredAnchors.has(step.anchor))
        .map((step) => `${tour.id}/${step.id}: ${step.anchor}`)
    );

    expect(missingAnchors, 'tour anchors without a page source declaration').toEqual([]);
  });
});
