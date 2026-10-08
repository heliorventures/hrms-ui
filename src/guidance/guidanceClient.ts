import type { GraphQLClient } from 'graphql-request';

import {
  MyGuidanceStateDocument as MY_GUIDANCE_STATE,
  DismissMyApplicationOverviewDocument as DISMISS_MY_APPLICATION_OVERVIEW,
} from '../api/graphql/graphql';

const RFC3339_TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|([+-])(\d{2}):(\d{2}))$/;

function validCalendarDate(year: number, month: number, day: number): boolean {
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

function validClock(hour: number, minute: number, second = 0): boolean {
  return hour <= 23 && minute <= 59 && second <= 59;
}

function toNullableDate(value: unknown): Date | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new TypeError('The guidance timestamp must be a string or null.');
  }

  const timestampParts = RFC3339_TIMESTAMP.exec(value);
  if (!timestampParts) {
    throw new RangeError('The guidance timestamp is invalid.');
  }

  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    ,
    ,
    offsetHourText,
    offsetMinuteText,
  ] = timestampParts;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const offsetHour = offsetHourText === undefined ? 0 : Number(offsetHourText);
  const offsetMinute = offsetMinuteText === undefined ? 0 : Number(offsetMinuteText);
  if (
    !validCalendarDate(year, month, day) ||
    !validClock(hour, minute, second) ||
    !validClock(offsetHour, offsetMinute)
  ) {
    throw new RangeError('The guidance timestamp is invalid.');
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('The guidance timestamp is invalid.');
  }

  return date;
}

function toRequiredDate(value: unknown): Date {
  const date = toNullableDate(value);
  if (date === null) {
    throw new TypeError('The overview dismissal response did not include a timestamp.');
  }

  return date;
}

export async function loadMyGuidanceState(client: GraphQLClient): Promise<Date | null> {
  const result = await client.request(MY_GUIDANCE_STATE);
  return toNullableDate(result.myGuidanceState.overviewDismissedAt);
}

export async function dismissMyApplicationOverview(client: GraphQLClient): Promise<Date> {
  const result = await client.request(DISMISS_MY_APPLICATION_OVERVIEW);
  return toRequiredDate(result.dismissMyApplicationOverview.overviewDismissedAt);
}
