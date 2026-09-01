// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AttendanceCursorPager from './AttendanceCursorPager';

afterEach(cleanup);

describe('AttendanceCursorPager', () => {
  it('disables Previous at the first cursor', () => {
    render(
      <AttendanceCursorPager
        cursorStack={[]}
        endCursor="opaque-next"
        hasNextPage
        loading={false}
        onCursorChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Previous page' }).disabled
    ).toBe(true);
  });

  it('passes the opaque end cursor when advancing', () => {
    const onCursorChange = vi.fn();
    render(
      <AttendanceCursorPager
        cursorStack={[]}
        endCursor="opaque-next"
        hasNextPage
        loading={false}
        onCursorChange={onCursorChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(onCursorChange).toHaveBeenCalledWith('opaque-next');
  });

  it('returns to the prior opaque cursor from the local cursor stack', () => {
    const onCursorChange = vi.fn();
    render(
      <AttendanceCursorPager
        cursorStack={['opaque-first', 'opaque-second']}
        endCursor="opaque-third"
        hasNextPage
        loading={false}
        onCursorChange={onCursorChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));

    expect(onCursorChange).toHaveBeenCalledWith('opaque-first');
  });

  it('disables navigation while loading', () => {
    render(
      <AttendanceCursorPager
        cursorStack={['opaque-first']}
        endCursor="opaque-next"
        hasNextPage
        loading
        onCursorChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Previous page' }).disabled
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled
    ).toBe(true);
  });

  it('cannot advance when the response has no end cursor', () => {
    render(
      <AttendanceCursorPager
        cursorStack={[]}
        endCursor={null}
        hasNextPage
        loading={false}
        onCursorChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled
    ).toBe(true);
  });

  it('announces the current page status politely', () => {
    render(
      <AttendanceCursorPager
        cursorStack={['opaque-first']}
        endCursor="opaque-next"
        hasNextPage
        loading={false}
        onCursorChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Page 2/).getAttribute('aria-live')).toBe('polite');
  });
});
