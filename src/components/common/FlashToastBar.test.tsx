// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import FlashToastBar from './FlashToastBar';

afterEach(cleanup);

describe('FlashToastBar', () => {
  it('announces successful actions politely', () => {
    render(
      <FlashToastBar
        toast={{ text: 'Attendance saved.', variant: 'success' }}
        onDismiss={() => undefined}
      />
    );

    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Attendance saved.');
  });

  it('announces transient errors assertively', () => {
    render(
      <FlashToastBar
        toast={{ text: 'Attendance was not saved.', variant: 'error' }}
        onDismiss={() => undefined}
      />
    );

    expect(screen.getByRole('alert').textContent).toContain('Attendance was not saved.');
  });
});
