// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';

import { MyAttendanceBoardDocument } from '../../api/attendance/graphql';

import {
  graphClient,
  renderPage,
  advanceToNextPage,
  requestCalls,
} from './attendancePageTestSupport';

it('requests the generated self-attendance document without an employee target', async () => {
  renderPage();

  await waitFor(() => {
    const call = requestCalls().find(([document]) => document === MyAttendanceBoardDocument);
    expect(call).toBeDefined();
    expect(call?.[1]).not.toHaveProperty('employeeId');
  });
});

it('suppresses malformed attendance rows that belong to another employee', async () => {
  renderPage();

  await waitFor(() => expect(screen.getByText('Present')).toBeTruthy());

  expect(screen.queryByText('Other Employee')).toBeNull();
});

it('resets the cursor to the first page when the selected month changes', async () => {
  renderPage();

  await screen.findByRole('button', { name: 'Next page' });
  await advanceToNextPage();
  await waitFor(() =>
    expect(graphClient.request).toHaveBeenCalledWith(
      MyAttendanceBoardDocument,
      expect.objectContaining({ after: 'opaque-next' })
    )
  );

  const month = screen.getByLabelText<HTMLSelectElement>('Month');
  const differentMonth = (Number(month.value) + 1) % 12;
  fireEvent.change(month, { target: { value: String(differentMonth) } });

  await waitFor(() => {
    const requests = requestCalls().filter(([document]) => document === MyAttendanceBoardDocument);
    expect(requests[requests.length - 1]?.[1]).toEqual(
      expect.objectContaining({ after: undefined, first: 50 })
    );
  });
});

it('resets the cursor to the first page when the selected year changes', async () => {
  renderPage();

  await screen.findByRole('button', { name: 'Next page' });
  await advanceToNextPage();
  await waitFor(() =>
    expect(graphClient.request).toHaveBeenCalledWith(
      MyAttendanceBoardDocument,
      expect.objectContaining({ after: 'opaque-next' })
    )
  );

  const year = screen.getByLabelText<HTMLSelectElement>('Year');
  const differentYear = Array.from(year.options).find((option) => option.value !== year.value);
  fireEvent.change(year, { target: { value: differentYear?.value } });

  await waitFor(() => {
    const requests = requestCalls().filter(([document]) => document === MyAttendanceBoardDocument);
    expect(requests[requests.length - 1]?.[1]).toEqual(
      expect.objectContaining({ after: undefined, first: 50 })
    );
  });
});
