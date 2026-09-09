// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import PageHeader from './PageHeader';

afterEach(cleanup);

it('keeps supporting descriptions behind the information control', () => {
  render(<PageHeader title="Reports" description="Choose a report for your team." />);
  expect(screen.queryByText('Choose a report for your team.')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Page information' }));
  expect(screen.getByRole('dialog').textContent).toContain('Choose a report for your team.');
});

it('does not add an empty information control', () => {
  render(<PageHeader title="Reports" actions={<button>Export</button>} />);
  expect(screen.queryByRole('button', { name: 'Page information' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Export' })).toBeTruthy();
});
