import type { LeaveBoardQuery } from '../../../api/graphql/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';

export type HolidayClient = Pick<ReturnType<typeof useGraphClient>, 'request'>;
export const HOLIDAY_TIMEOUT_MESSAGE = 'Company holidays took too long to load. Try again.';
const HOLIDAY_TIMEOUT_MS = 30 * 1000;
const HOLIDAY_DOCUMENT = `
  query HrLeaveApplicationHolidays {
    upcomingHolidays(limit: 100) {
      id calendarId calendarName holidayDate name holidayType
    }
  }
`;

/** Each request owns its timer and abort signal; old requests cannot cancel new deadlines. */
export function requestLeaveApplicationHolidays(client: HolidayClient) {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(HOLIDAY_TIMEOUT_MESSAGE));
      controller.abort();
    }, HOLIDAY_TIMEOUT_MS);
  });
  const request = client.request<Pick<LeaveBoardQuery, 'upcomingHolidays'>>({
    document: HOLIDAY_DOCUMENT,
    signal: controller.signal,
  });
  return {
    promise: Promise.race([request, timeout]).finally(() => clearTimeout(timeoutId)),
    cancel: () => {
      clearTimeout(timeoutId);
      controller.abort();
    },
  };
}
