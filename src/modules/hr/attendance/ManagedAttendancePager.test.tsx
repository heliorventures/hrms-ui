// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ManagedAttendancePager from './ManagedAttendancePager';

afterEach(cleanup);

describe('ManagedAttendancePager', () => {
  it('passes the opaque cursor through unchanged', () => {
    const onNext = vi.fn();
    const cursor = 'eyJwYWdlIjoyfS4opaque-value';
    render(
      <ManagedAttendancePager
        hasPreviousPage={false}
        hasNextPage
        endCursor={cursor}
        loading={false}
        onPrevious={vi.fn()}
        onNext={onNext}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onNext).toHaveBeenCalledWith(cursor);
  });

  it('disables unavailable previous and next navigation while loading or missing a cursor', () => {
    render(
      <ManagedAttendancePager
        hasPreviousPage={false}
        hasNextPage
        endCursor={null}
        loading
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect((screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
