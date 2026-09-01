// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ActionMenu, { type ActionMenuItem } from './ActionMenu';

const items = (onSelect = vi.fn()): readonly ActionMenuItem[] => [
  { id: 'profile', label: 'Profile settings', href: '/profile/settings' },
  { id: 'theme', label: 'Change theme', onSelect },
  { id: 'disabled-link', label: 'Unavailable link', href: '/unavailable', disabled: true },
  { id: 'disabled-action', label: 'Unavailable action', onSelect: vi.fn(), disabled: true },
  { id: 'logout', label: 'Log out', onSelect: vi.fn(), tone: 'danger' },
];

function renderMenu(menuItems = items(), align: 'start' | 'end' = 'end') {
  return render(
    <MemoryRouter>
      <button type="button">Before control</button>
      <ActionMenu label="Account actions" items={menuItems} align={align} />
      <button type="button">Outside control</button>
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ActionMenu', () => {
  it('renders linked action variants, disabled states, and a separated danger group', async () => {
    const onSelect = vi.fn();
    renderMenu(items(onSelect));
    const trigger = screen.getByRole('button', { name: 'Account actions' });

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);

    const menu = screen.getByRole('menu', { name: 'Account actions' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
    expect(screen.getByRole('menuitem', { name: 'Profile settings' }).getAttribute('href')).toBe(
      '/profile/settings'
    );
    expect(screen.getByRole('menuitem', { name: 'Unavailable link' }).getAttribute('aria-disabled')).toBe(
      'true'
    );
    expect(
      screen.getByRole('menuitem', { name: 'Unavailable action' }).hasAttribute('disabled')
    ).toBe(true);
    expect(screen.getByRole('separator')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Log out' }).getAttribute('data-tone')).toBe(
      'danger'
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Profile settings' }))
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Change theme' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('supports Arrow, Home, End, and Escape keyboard behavior', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Account actions' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const profile = await screen.findByRole('menuitem', { name: 'Profile settings' });
    const logout = screen.getByRole('menuitem', { name: 'Log out' });
    await waitFor(() => expect(document.activeElement).toBe(profile));

    fireEvent.keyDown(profile, { key: 'End' });
    expect(document.activeElement).toBe(logout);
    fireEvent.keyDown(logout, { key: 'Home' });
    expect(document.activeElement).toBe(profile);
    fireEvent.keyDown(profile, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(logout);
    fireEvent.keyDown(logout, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(profile);

    fireEvent.keyDown(profile, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('dismisses on click-away and restores focus to the trigger', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Account actions' });
    fireEvent.click(trigger);
    await screen.findByRole('menu');

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside control' }));

    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('uses menu-managed focus and dismisses to the adjacent control on Tab exit', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Account actions' });
    fireEvent.click(trigger);
    const profile = await screen.findByRole('menuitem', { name: 'Profile settings' });
    await waitFor(() => expect(document.activeElement).toBe(profile));
    expect(screen.getAllByRole('menuitem').every((item) => item.tabIndex === -1)).toBe(true);

    fireEvent.keyDown(profile, { key: 'Tab' });

    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside control' }));

    fireEvent.click(trigger);
    const reopenedProfile = await screen.findByRole('menuitem', { name: 'Profile settings' });
    await waitFor(() => expect(document.activeElement).toBe(reopenedProfile));
    fireEvent.keyDown(reopenedProfile, { key: 'Tab', shiftKey: true });

    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before control' }));
  });

  it.each(['start', 'end'] as const)(
    'clamps %s placement to the viewport and records collision direction',
    async (align) => {
      const originalRect = HTMLElement.prototype.getBoundingClientRect;
      const originalComputedStyle = window.getComputedStyle.bind(window);
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement
      ) {
        if (this.getAttribute('aria-haspopup') === 'menu') {
          return {
            bottom: 544,
            height: 44,
            left: align === 'start' ? 590 : 30,
            right: align === 'start' ? 634 : 74,
            top: 500,
            width: 44,
            x: align === 'start' ? 590 : 30,
            y: 500,
            toJSON: () => ({}),
          } as DOMRect;
        }
        if (this.getAttribute('role') === 'menu') {
          return {
            bottom: 200,
            height: 240,
            left: 0,
            right: 240,
            top: 0,
            width: 240,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          } as DOMRect;
        }
        return originalRect.call(this);
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

      renderMenu(items(), align);
      fireEvent.click(screen.getByRole('button', { name: 'Account actions' }));
      const menu = await screen.findByRole('menu');

      await waitFor(() => expect(menu.style.left).not.toBe(''));
      expect(Number.parseFloat(menu.style.left)).toBe(align === 'start' ? 354 : 76);
      expect(Number.parseFloat(menu.style.top)).toBe(252);
      expect(menu.style.maxWidth).toBe('518px');
      expect(menu.style.maxHeight).toBe('434px');
      expect(menu.getAttribute('data-align')).toBe(align);
      expect(menu.getAttribute('data-placement')).toBe('top');
    }
  );
});
