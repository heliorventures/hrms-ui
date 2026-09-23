// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, expect, it } from 'vitest';

import { NAVIGATION_COLLAPSED_KEY } from '../navigation/navigationPreference';

import { useNavigationAppearance } from './useNavigationAppearance';

const Probe = () => {
  const { collapsed, toggle } = useNavigationAppearance();
  return <button onClick={toggle}>{collapsed ? 'Collapsed' : 'Expanded'}</button>;
};
afterEach(() => {
  cleanup();
  localStorage.clear();
});

it('retains the remembered state across StrictMode effect replay', () => {
  localStorage.setItem(NAVIGATION_COLLAPSED_KEY, 'true');
  render(
    <StrictMode>
      <Probe />
    </StrictMode>
  );
  expect(screen.getByRole('button', { name: 'Collapsed' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button'));
  expect(localStorage.getItem(NAVIGATION_COLLAPSED_KEY)).toBe('false');
  expect(screen.getByRole('button', { name: 'Expanded' })).toBeTruthy();
});
