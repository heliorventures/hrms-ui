// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import EmptyState from './EmptyState';

afterEach(cleanup);

describe('EmptyState', () => {
  it('explains the empty result and offers the authorized next action', () => {
    render(
      <EmptyState
        title="No employees match this search"
        description="Change the search words and try again."
        action={<button type="button">Clear search</button>}
      />
    );

    const status = screen.getByRole('status');
    expect(status.textContent).toContain('No employees match this search');
    expect(status.textContent).toContain('Change the search words and try again.');
    expect(screen.getByRole('button', { name: 'Clear search' })).not.toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
