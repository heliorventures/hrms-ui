// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GuidanceProvider from '../../guidance/GuidanceProvider';
import type { TourDefinition } from '../../guidance/tourTypes';
import { PageInformationContext } from '../common/pageInformationContext';

import PageTools from './PageTools';

vi.mock('../../navigation/useAccessibleNavigation', () => ({
  useAccessibleNavigation: () => [],
}));
vi.mock('./NotificationDropdown', () => ({ default: () => null }));

const overviewTour: TourDefinition = {
  id: 'application-overview',
  routePaths: [],
  steps: [{ id: 'welcome', anchor: null, title: 'Welcome', body: 'Explore your HRMS.' }],
};
const contextualPageTour: TourDefinition = {
  id: 'employee-detail',
  routePaths: ['organization/employees/:employeeId'],
  steps: [{ id: 'employee', anchor: null, title: 'Employee details', body: 'Review this profile.' }],
};

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

function renderPageTools({ route = 'dashboard', hasInformation = true } = {}) {
  const openInformation = vi.fn();
  const onOverviewDismiss = vi.fn();
  const root = document.getElementById('root');
  if (!root) throw new Error('Application root is unavailable');

  render(
    <MemoryRouter initialEntries={['/organization/employees/employee-9?tab=history']}>
      <GuidanceProvider
        matchedRoutePath={route}
        identityKey="tenant-a:user-a"
        overviewTour={overviewTour}
        registeredTours={[contextualPageTour]}
        onOverviewDismiss={onOverviewDismiss}
      >
        <PageInformationContext.Provider
          value={{
            register: () => () => undefined,
            target: null,
            hasInformation,
            isOpen: false,
            open: openInformation,
          }}
        >
          <PageTools />
        </PageInformationContext.Provider>
      </GuidanceProvider>
    </MemoryRouter>,
    { container: root }
  );
  return { openInformation, onOverviewDismiss };
}

describe('PageTools Help menu', () => {
  it('keeps About this page and always offers overview replay', async () => {
    const { openInformation, onOverviewDismiss } = renderPageTools({
      route: 'organization/employees/:employeeId',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(screen.getByRole('menuitem', { name: 'About this page' })).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: 'About this page' }));
    expect(openInformation).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Replay application overview' }));
    expect(await screen.findByRole('dialog', { name: 'Welcome' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close tour' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onOverviewDismiss).not.toHaveBeenCalled();
  });

  it('offers a page tour only for the matched registered route identity', () => {
    const matching = renderPageTools({ route: 'organization/employees/:employeeId', hasInformation: false });
    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(screen.getByRole('menuitem', { name: 'Start page tour' })).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Start page tour' }));
    expect(screen.getByRole('dialog', { name: 'Employee details' })).toBeTruthy();
    matching.openInformation.mockClear();
    cleanup();

    renderPageTools({ route: 'organization/employees', hasInformation: false });
    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(screen.getByRole('menuitem', { name: 'Replay application overview' })).toBeTruthy();
    expect(screen.queryByRole('menuitem', { name: 'Start page tour' })).toBeNull();
  });
});
