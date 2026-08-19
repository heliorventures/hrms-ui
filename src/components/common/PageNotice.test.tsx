// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import PageNotice from './PageNotice';

afterEach(cleanup);

describe('PageNotice', () => {
  it('announces an actionable error and moves focus to it', async () => {
    render(
      <PageNotice variant="error" title="Attendance was not saved" focusOnMount>
        Try again.
      </PageNotice>
    );

    const notice = screen.getByRole('alert');
    await waitFor(() => expect(document.activeElement).toBe(notice));
    expect(notice.textContent).toContain('Attendance was not saved');
    expect(notice.textContent).toContain('Try again.');
  });

  it('renders a supplied recovery action', async () => {
    const user = userEventLibrary.setup();
    let retried = false;
    render(
      <PageNotice
        action={
          <button
            onClick={() => {
              retried = true;
            }}
          >
            Retry
          </button>
        }
      >
        Attendance is unavailable.
      </PageNotice>
    );

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retried).toBe(true);
  });

  it('dismisses only when a dismiss handler is supplied', async () => {
    const user = userEventLibrary.setup();
    let dismissed = false;
    const { rerender } = render(<PageNotice>Saved.</PageNotice>);

    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();

    rerender(
      <PageNotice
        onDismiss={() => {
          dismissed = true;
        }}
      >
        Saved.
      </PageNotice>
    );
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(dismissed).toBe(true);
  });
});
