// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ForgotPasswordPage from './ForgotPasswordPage';

const tenantState = vi.hoisted(() => ({
  currentTenant: {
    companyCode: 'NORTH',
    id: 'tenant-northstar',
    name: 'Northstar Health',
  },
}));

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => tenantState,
}));

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

function renderPage() {
  return render(
    <MemoryRouter future={routerFuture}>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  tenantState.currentTenant = {
    companyCode: 'NORTH',
    id: 'tenant-northstar',
    name: 'Northstar Health',
  };
});

afterEach(() => {
  cleanup();
});

describe('ForgotPasswordPage', () => {
  it('identifies the resolved organization in one semantic page landmark', () => {
    renderPage();

    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('Northstar Health')).toBeTruthy();
  });

  it('uses the product name when the tenant name is unavailable', () => {
    tenantState.currentTenant = {
      companyCode: '',
      id: '',
      name: '   ',
    };

    renderPage();

    expect(screen.getByText('Helior HRMS')).toBeTruthy();
  });

  it('provides administrator and HR reset guidance without collecting an identifier', () => {
    const { container } = renderPage();

    expect(screen.getByText(/administrator or HR team can reset your sign-in/i)).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('form')).toBeNull();
  });

  it('does not claim email delivery or expose an email requirement', () => {
    renderPage();

    expect(screen.queryByText(/email|sent|inbox|delivery/i)).toBeNull();
  });

  it('offers a standard link back to tenant sign-in', () => {
    renderPage();

    expect(screen.getByRole('link', { name: /back to sign in/i }).getAttribute('href')).toBe(
      '/login'
    );
  });
});
