// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AllCompanyHolidaysQuery } from '../../../api/graphql/graphql';
import AllHolidaysModal from './AllHolidaysModal';

afterEach(cleanup);

describe('AllHolidaysModal', () => {
  it('explains a load failure, offers retry, and preserves previously loaded holidays', () => {
    const onRetry = vi.fn();
    const holidays = [
      {
        id: 'holiday-1',
        name: 'Founders Day',
        holidayDate: '2026-08-20',
        calendarName: 'India',
        holidayType: 'PUBLIC',
      },
    ] as AllCompanyHolidaysQuery['upcomingHolidays'];

    render(
      <AllHolidaysModal
        holidays={holidays}
        failure="We could not connect right now. Check your connection and try again."
        isOpen
        loading={false}
        onClose={vi.fn()}
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole('alert').textContent).toContain('Company holidays could not be loaded');
    expect(screen.getByText('Founders Day')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
