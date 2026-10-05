// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import PayrollHelp from './PayrollHelp';

afterEach(cleanup);
it('dismisses hover help with Escape while focus is elsewhere', () => {
  render(<PayrollHelp label="Calculation help">Uses effective salary settings.</PayrollHelp>);
  const button = screen.getByRole('button', { name: 'Calculation help' });
  const wrapper = button.parentElement;
  if (!wrapper) throw new Error('Help trigger must have a hover wrapper');
  fireEvent.mouseEnter(wrapper);
  expect(button.getAttribute('aria-expanded')).toBe('true');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(button.getAttribute('aria-expanded')).toBe('false');
});
it('opens help on keyboard focus and lets Escape dismiss it while focused', () => {
  render(<PayrollHelp label="Calculation help">Uses effective salary settings.</PayrollHelp>);
  const button = screen.getByRole('button', { name: 'Calculation help' });
  fireEvent.focus(button);
  expect(button.getAttribute('aria-expanded')).toBe('true');
  fireEvent.keyDown(button, { key: 'Escape' });
  expect(button.getAttribute('aria-expanded')).toBe('false');
  expect(screen.getByText('Uses effective salary settings.').classList.contains('hidden')).toBe(
    true
  );
});
it('opens help with a tap and closes it when focus leaves', () => {
  render(<PayrollHelp label="Calculation help">Uses effective salary settings.</PayrollHelp>);
  const button = screen.getByRole('button', { name: 'Calculation help' });
  fireEvent.click(button);
  expect(button.getAttribute('aria-expanded')).toBe('true');
  fireEvent.blur(button);
  expect(button.getAttribute('aria-expanded')).toBe('false');
});
