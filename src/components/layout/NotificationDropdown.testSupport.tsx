import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';

import { MarkNotificationReadDocument } from '../../api/graphql/graphql';
import type { ParsedClientSession } from '../../auth/clientSession';
import {
  NotificationPreviewDocument,
  UnreadNotificationCountDocument,
} from '../../modules/notifications/notificationQueries';

import NotificationDropdown from './NotificationDropdown';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  request: vi.fn(),
  client: { request: vi.fn() },
  clientSession: null as ParsedClientSession | null,
  tenantId: null as string | null,
  resolvedTenantId: '' as string,
}));

export function notificationMocks() {
  return mocks;
}

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    can: () => false,
    clientSession: mocks.clientSession,
    tenantId: mocks.tenantId,
  }),
}));

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: mocks.resolvedTenantId } }),
}));

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => mocks.client,
}));

export const tenantA = 'e6d4fc13-feb8-52a0-93bd-f66c795969b1';
export const tenantB = '342205fc-98b1-5421-8a11-b30821c86aa0';

export const preview = [
  {
    id: 'notification-1',
    title: 'Policy update',
    message: 'Review the updated leave policy.',
    actionUrl: '/leave',
    isRead: false,
    createdAt: '2026-08-20T08:00:00.000Z',
  },
];

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

function employeeSession(): ParsedClientSession {
  return {
    jwtRoles: [],
    permissions: new Set(['leave:read']),
    permissionScopes: { 'leave:read': 'SELF' },
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };
}

export function setSuccessfulRequests(unread = 3) {
  mocks.request.mockImplementation((document: unknown) => {
    if (document === UnreadNotificationCountDocument) {
      return Promise.resolve({ unreadNotificationCount: unread });
    }
    if (document === NotificationPreviewDocument) {
      return Promise.resolve({ notifications: preview });
    }
    if (document === MarkNotificationReadDocument) {
      return Promise.resolve({ markNotificationRead: true });
    }
    return Promise.reject(new Error('Unexpected document'));
  });
}

export const notificationRequestScenarios = {
  previewFailure() {
    mocks.request.mockImplementation((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        return Promise.resolve({ unreadNotificationCount: 0 });
      }
      if (document === NotificationPreviewDocument) {
        return Promise.reject(new Error('preview unavailable'));
      }
      return Promise.reject(new Error('Unexpected document'));
    });
  },
  retainedRefresh(pendingRefresh: Promise<{ notifications: typeof preview }>) {
    let previewRequestCount = 0;
    mocks.request.mockImplementation((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        return Promise.resolve({ unreadNotificationCount: 0 });
      }
      if (document === NotificationPreviewDocument) {
        previewRequestCount += 1;
        return previewRequestCount === 1
          ? Promise.resolve({ notifications: preview })
          : pendingRefresh;
      }
      return Promise.resolve({ markNotificationRead: true });
    });
  },
};

export function notificationTree() {
  return (
    <MemoryRouter future={routerFuture}>
      <NotificationDropdown />
      <button type="button" data-testid="outside">
        Outside
      </button>
    </MemoryRouter>
  );
}

export function renderNotifications() {
  return render(notificationTree());
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

export function installDropdownGeometry() {
  const originalComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement
  ) {
    if (this.tagName === 'BUTTON' && this.hasAttribute('aria-controls')) {
      return {
        bottom: 544,
        height: 44,
        left: 30,
        right: 74,
        top: 500,
        width: 44,
        x: 30,
        y: 500,
        toJSON: () => ({}),
      } as DOMRect;
    }
    if (this.getAttribute('role') === 'region') {
      return {
        bottom: 400,
        height: 400,
        left: 0,
        right: 320,
        top: 0,
        width: 320,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    }
    return {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  });
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element: Element) => {
    if ((element as HTMLElement).hasAttribute('data-safe-area-probe')) {
      return {
        paddingTop: '10px',
        paddingRight: '30px',
        paddingBottom: '24px',
        paddingLeft: '20px',
      } as CSSStyleDeclaration;
    }
    return originalComputedStyle(element);
  });
  vi.stubGlobal('innerWidth', 1200);
  vi.stubGlobal('innerHeight', 1000);
  vi.stubGlobal('visualViewport', {
    width: 600,
    height: 500,
    offsetLeft: 40,
    offsetTop: 60,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

beforeEach(() => {
  mocks.client = { request: mocks.request };
  mocks.clientSession = employeeSession();
  mocks.tenantId = tenantA;
  mocks.resolvedTenantId = tenantA;
  setSuccessfulRequests();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
