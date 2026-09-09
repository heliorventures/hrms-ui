// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import PageHeader from './PageHeader';
import { CompactPageContext } from './compactPageContext';

afterEach(cleanup);

it('keeps a semantic title and visible actions in the compact application shell', () => {
  render(
    <CompactPageContext.Provider value>
      <PageHeader title="Insights" actions={<button>Export</button>} />
    </CompactPageContext.Provider>
  );
  expect(screen.getByRole('heading', { name: 'Insights' }).parentElement?.className).toBe(
    'sr-only'
  );
  expect(screen.getByRole('button', { name: 'Export' })).toBeTruthy();
});

it('retains contextual report titles in the compact application shell', () => {
  render(
    <CompactPageContext.Provider value>
      <PageHeader title="September payroll" retainTitle />
    </CompactPageContext.Provider>
  );
  expect(
    screen.getByRole('heading', { name: 'September payroll' }).parentElement?.className
  ).not.toBe('sr-only');
});

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
