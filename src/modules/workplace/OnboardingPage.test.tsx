// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import OnboardingPage from './OnboardingPage';

type Deferred<T> = {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T) => void;
};

const deferred = <T,>(): Deferred<T> => {
  let reject!: Deferred<T>['reject'];
  let resolve!: Deferred<T>['resolve'];
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
};

const operationName = (document: TypedDocumentNode<unknown, unknown>): string | undefined => {
  const operation = document.definitions.find(
    (definition) => definition.kind === 'OperationDefinition'
  );
  return operation?.kind === 'OperationDefinition' ? operation.name?.value : undefined;
};

const checklistItem = (id: string, taskName: string) => ({
  id,
  taskName,
  taskCategory: 'People',
  dueDate: null,
  isCompleted: false,
});

const separation = (id: string, separationType: string, status = 'APPROVED') => ({
  id,
  separationType,
  resignationDate: null,
  lastWorkingDate: '2026-08-31',
  reason: null,
  status,
  createdAt: '2026-08-01T00:00:00Z',
});

const clearance = (id: string, separationId: string, taskName: string) => ({
  id,
  separationId,
  department: 'IT',
  taskName,
  isCleared: false,
  clearedAt: null,
});

const mocks = vi.hoisted(() => {
  const clientA = { request: vi.fn() };
  const clientB = { request: vi.fn() };
  return {
    canManageOnboarding: false,
    clientA,
    clientB,
    confirm: vi.fn(),
    currentClient: clientA,
  };
});

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => mocks.currentClient,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ clientSession: null }),
}));

vi.mock('../../auth/permissionService', () => ({
  createPermissionService: () => ({
    canCapability: () => mocks.canManageOnboarding,
  }),
}));

vi.mock('../../contexts/DialogContext', () => ({
  useDialogs: () => ({ alert: vi.fn(), confirm: mocks.confirm }),
}));

const defaultResponse = (document: TypedDocumentNode<unknown, unknown>) => {
  switch (operationName(document)) {
    case 'OnboardingChecklist':
      return Promise.resolve({ onboardingChecklist: [] });
    case 'ClientOpsSeparationsList':
      return Promise.resolve({ separations: [] });
    case 'ClientOpsFnfBySeparation':
      return Promise.resolve({ fnfSettlement: null });
    case 'ClientOpsClearanceBySeparation':
      return Promise.resolve({ clearanceChecklist: [] });
    default:
      return Promise.resolve({});
  }
};

beforeEach(() => {
  mocks.canManageOnboarding = false;
  mocks.currentClient = mocks.clientA;
  mocks.confirm.mockReset();
  mocks.clientA.request.mockReset();
  mocks.clientB.request.mockReset();
  mocks.clientA.request.mockImplementation(defaultResponse);
  mocks.clientB.request.mockImplementation(defaultResponse);
});

afterEach(cleanup);

describe('OnboardingPage tabs', () => {
  it('keeps stable tab-to-panel wiring while changing the visible panel', async () => {
    const user = userEventLibrary.setup();
    render(<OnboardingPage />);

    const joinTab = screen.getByRole('tab', { name: 'Joining Checklist' });
    const exitTab = screen.getByRole('tab', { name: 'Exit & Separation' });
    const joinPanel = screen.getByRole('tabpanel', { name: 'Joining Checklist' });
    const exitPanel = document.getElementById('onboarding-tab-exit');

    expect(joinTab.id).toBe('onboarding-tab-join-tab');
    expect(exitTab.id).toBe('onboarding-tab-exit-tab');
    expect(joinTab.getAttribute('aria-controls')).toBe(joinPanel.id);
    expect(joinPanel.getAttribute('aria-labelledby')).toBe(joinTab.id);
    expect(exitPanel?.getAttribute('aria-labelledby')).toBe(exitTab.id);
    expect(exitPanel?.hidden).toBe(true);
    await waitFor(() => expect(mocks.clientA.request).toHaveBeenCalledTimes(1));

    await user.click(exitTab);
    expect(exitTab.getAttribute('aria-selected')).toBe('true');
    expect(exitPanel?.hidden).toBe(false);
    expect(joinPanel.hidden).toBe(true);
    await waitFor(() => expect(mocks.clientA.request).toHaveBeenCalledTimes(2));
  });
});

describe('OnboardingPage request ownership', () => {
  it('does not publish a checklist refresh from a previous client', async () => {
    const staleRefresh = deferred<{ onboardingChecklist: ReturnType<typeof checklistItem>[] }>();
    let checklistRequests = 0;
    mocks.clientA.request.mockImplementation((document) => {
      if (operationName(document) === 'OnboardingChecklist') {
        checklistRequests += 1;
        return checklistRequests === 1
          ? Promise.resolve({ onboardingChecklist: [checklistItem('a', 'Client A task')] })
          : staleRefresh.promise;
      }
      return defaultResponse(document);
    });
    mocks.clientB.request.mockImplementation((document) =>
      operationName(document) === 'OnboardingChecklist'
        ? Promise.resolve({ onboardingChecklist: [checklistItem('b', 'Client B task')] })
        : defaultResponse(document)
    );
    const user = userEventLibrary.setup();
    const view = render(<OnboardingPage />);

    await screen.findByText('Client A task');
    await user.click(screen.getByRole('button', { name: 'Mark done' }));
    await waitFor(() => expect(checklistRequests).toBe(2));

    mocks.currentClient = mocks.clientB;
    view.rerender(<OnboardingPage />);
    await screen.findByText('Client B task');

    staleRefresh.resolve({ onboardingChecklist: [checklistItem('stale', 'Stale client task')] });
    await waitFor(() => expect(screen.queryByText('Stale client task')).toBeNull());
    expect(screen.getByText('Client B task')).toBeTruthy();
  });

  it('does not publish a separation refresh from a previous client', async () => {
    mocks.canManageOnboarding = true;
    const staleRefresh = deferred<{ separations: ReturnType<typeof separation>[] }>();
    let separationRequests = 0;
    mocks.clientA.request.mockImplementation((document) => {
      if (operationName(document) === 'ClientOpsSeparationsList') {
        separationRequests += 1;
        return separationRequests === 1
          ? Promise.resolve({ separations: [separation('a', 'CLIENT_A', 'PENDING')] })
          : staleRefresh.promise;
      }
      return defaultResponse(document);
    });
    mocks.clientB.request.mockImplementation((document) =>
      operationName(document) === 'ClientOpsSeparationsList'
        ? Promise.resolve({ separations: [separation('b', 'CLIENT_B')] })
        : defaultResponse(document)
    );
    const user = userEventLibrary.setup();
    const view = render(<OnboardingPage />);

    await user.click(screen.getByRole('tab', { name: 'Exit & Separation' }));
    await screen.findByText(/CLIENT_A/);
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(separationRequests).toBe(2));

    mocks.currentClient = mocks.clientB;
    view.rerender(<OnboardingPage />);
    await screen.findByText(/CLIENT_B/);

    staleRefresh.resolve({ separations: [separation('stale', 'STALE_CLIENT')] });
    await waitFor(() => expect(screen.queryByText(/STALE_CLIENT/)).toBeNull());
    expect(screen.getByText(/CLIENT_B/)).toBeTruthy();
  });

  it('keeps offboarding details owned by the currently selected separation', async () => {
    const staleFnf = deferred<{ fnfSettlement: null }>();
    const staleClearance = deferred<{
      clearanceChecklist: ReturnType<typeof clearance>[];
    }>();
    mocks.clientA.request.mockImplementation((document, variables) => {
      const name = operationName(document);
      if (name === 'ClientOpsSeparationsList') {
        return Promise.resolve({
          separations: [separation('a', 'FIRST'), separation('b', 'SECOND')],
        });
      }
      if (name === 'ClientOpsFnfBySeparation') {
        return variables?.separationId === 'a'
          ? staleFnf.promise
          : Promise.resolve({ fnfSettlement: null });
      }
      if (name === 'ClientOpsClearanceBySeparation') {
        return variables?.separationId === 'a'
          ? staleClearance.promise
          : Promise.resolve({ clearanceChecklist: [clearance('b-cl', 'b', 'Return badge')] });
      }
      return defaultResponse(document);
    });
    const user = userEventLibrary.setup();
    render(<OnboardingPage />);

    await user.click(screen.getByRole('tab', { name: 'Exit & Separation' }));
    await screen.findByText(/FIRST/);
    const detailButtons = screen.getAllByRole('button', { name: 'Clearance & FNF' });
    await user.click(detailButtons[0]);
    await user.click(detailButtons[1]);
    await screen.findByText(/Return badge/);

    staleFnf.resolve({ fnfSettlement: null });
    staleClearance.resolve({ clearanceChecklist: [clearance('a-cl', 'a', 'Return laptop')] });
    await waitFor(() => expect(screen.queryByText(/Return laptop/)).toBeNull());
    expect(screen.getByText(/Return badge/)).toBeTruthy();
  });

  it('keeps valid offboarding data visible when a refresh fails and offers recovery', async () => {
    mocks.canManageOnboarding = true;
    let fnfRequests = 0;
    let clearanceRequests = 0;
    mocks.clientA.request.mockImplementation((document) => {
      const name = operationName(document);
      if (name === 'ClientOpsSeparationsList') {
        return Promise.resolve({ separations: [separation('a', 'RESIGNATION')] });
      }
      if (name === 'ClientOpsFnfBySeparation') {
        fnfRequests += 1;
        return fnfRequests === 1
          ? Promise.resolve({ fnfSettlement: null })
          : Promise.reject(new Error('upstream unavailable'));
      }
      if (name === 'ClientOpsClearanceBySeparation') {
        clearanceRequests += 1;
        return clearanceRequests === 1
          ? Promise.resolve({
              clearanceChecklist: [clearance('a-cl', 'a', 'Return laptop')],
            })
          : Promise.reject(new Error('upstream unavailable'));
      }
      return defaultResponse(document);
    });
    const user = userEventLibrary.setup();
    render(<OnboardingPage />);

    await user.click(screen.getByRole('tab', { name: 'Exit & Separation' }));
    await screen.findByText(/RESIGNATION/);
    await user.click(screen.getByRole('button', { name: 'Clearance & FNF' }));
    await screen.findByText(/Return laptop/);
    await user.click(screen.getByRole('checkbox', { name: 'Cleared' }));

    expect(
      await screen.findByText(
        'We could not refresh the clearance and final settlement details. Your last loaded information is still shown.'
      )
    ).toBeTruthy();
    expect(screen.getByText(/Return laptop/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
  });
});
