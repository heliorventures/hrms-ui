// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FeatureAccessContext } from './featureTypes';
import {
  captureGuidanceFormSave,
  focusFeatureAnchor,
  navigateTourStep,
  watchGuidanceForms,
} from './tourNavigation';

const context: FeatureAccessContext = {
  routePath: 'expenses',
  canAccessPath: () => true,
  allowedTabIds: () => ['travel'],
  canCapability: () => true,
};
const step = {
  id: 'travel',
  anchor: 'travel.action',
  title: 'Travel',
  body: 'Details',
  destination: { path: '/expenses?tab=travel', tabId: 'travel' },
  isVisible: () => true,
};
afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});
describe('explanatory navigation', () => {
  it('selects permitted tabs without invoking any action and rechecks access', () => {
    const navigate = vi.fn();
    navigateTourStep(step, context, navigate);
    expect(navigate).toHaveBeenCalledWith('/expenses?tab=travel');
    navigate.mockClear();
    navigateTourStep(step, { ...context, canAccessPath: () => false }, navigate);
    expect(navigate).not.toHaveBeenCalled();
    navigateTourStep(step, { ...context, allowedTabIds: () => [] }, navigate);
    expect(navigate).not.toHaveBeenCalled();
  });
  it('blocks navigation from a changed form or an open request dialog', () => {
    watchGuidanceForms();
    document.body.innerHTML = '<form><input></form>';
    document.querySelector('input')?.dispatchEvent(new Event('input', { bubbles: true }));
    const navigate = vi.fn();
    expect(navigateTourStep(step, context, navigate).status).toBe('blocked');
    expect(navigate).not.toHaveBeenCalled();
  });
  it('clears a successful mounted form save while retaining edits made during the request', () => {
    watchGuidanceForms();
    document.body.innerHTML = '<form><input></form>';
    const input = document.querySelector('input');
    const form = document.querySelector('form');
    input?.dispatchEvent(new Event('input', { bubbles: true }));
    const saved = captureGuidanceFormSave(form);
    saved();
    expect(navigateTourStep(step, context, vi.fn()).status).toBe('ready');
    input?.dispatchEvent(new Event('input', { bubbles: true }));
    const inFlight = captureGuidanceFormSave(form);
    input?.dispatchEvent(new Event('input', { bubbles: true }));
    inFlight();
    expect(navigateTourStep(step, context, vi.fn()).status).toBe('blocked');
  });
  it('waits for a late anchor, cancels stale focus and tolerates an empty state', () => {
    vi.useFakeTimers();
    let current = true;
    focusFeatureAnchor('late', () => current);
    vi.advanceTimersByTime(100);
    document.body.innerHTML = '<button data-tour-anchor="late">Action</button>';
    const action = vi.fn();
    document.querySelector('button')?.addEventListener('click', action);
    vi.advanceTimersByTime(100);
    expect(document.activeElement).toBe(document.querySelector('button'));
    expect(action).not.toHaveBeenCalled();
    focusFeatureAnchor('missing', () => current);
    current = false;
    vi.runAllTimers();
  });
  it('requires explicit confirmation to leave a dirty form and still rejects revoked access', () => {
    document.body.innerHTML = '<div data-guidance-dirty="true"></div>';
    const navigate = vi.fn();
    expect(navigateTourStep(step, context, navigate).status).toBe('blocked');
    expect(navigateTourStep(step, context, navigate, true).status).toBe('ready');
    expect(navigate).toHaveBeenCalledOnce();
    expect(
      navigateTourStep(step, { ...context, canAccessPath: () => false }, navigate, true).status
    ).toBe('blocked');
    expect(navigate).toHaveBeenCalledOnce();
  });
  it('ignores read-only filter forms and focuses only an anchor with visible ancestors', () => {
    vi.useFakeTimers();
    watchGuidanceForms();
    document.body.innerHTML =
      '<form data-guidance-read-only="true"><input></form><div style="display:none"><button data-tour-anchor="hidden">Hidden</button></div>';
    document.querySelector('input')?.dispatchEvent(new Event('input', { bubbles: true }));
    expect(navigateTourStep(step, context, vi.fn()).status).toBe('ready');
    focusFeatureAnchor('hidden', () => true);
    vi.runAllTimers();
    expect(document.activeElement).not.toBe(document.querySelector('button'));
  });
});
