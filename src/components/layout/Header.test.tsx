// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import Header from './Header';

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { name: 'Acme' } }),
}));
vi.mock('./CommandPaletteContext', () => ({ useCommandPalette: () => ({ open: vi.fn() }) }));
vi.mock('./ProfileDropdown', () => ({ default: () => <button type="button">Profile</button> }));
afterEach(cleanup);

it('provides a logo expand control when navigation is hidden and keeps page tools out of the header', () => {
  const expand = vi.fn();
  render(
    <Header
      desktopNavigationCollapsed
      onExpandDesktopNavigation={expand}
      mobileNavigationOpen={false}
      mobileNavigationTriggerRef={createRef()}
      onOpenMobileNavigation={vi.fn()}
    />
  );
  const toggle = screen.getByRole('button', { name: 'Expand navigation' });
  fireEvent.click(toggle);
  expect(expand).toHaveBeenCalledOnce();
  expect(screen.queryByRole('button', { name: 'Page information' })).toBeNull();
  expect(screen.queryByRole('button', { name: /Notifications/ })).toBeNull();
  expect(screen.queryByRole('searchbox')).toBeNull();
});
