import { FormEvent, useCallback, useEffect, useState } from 'react';
import type { useDialogs } from '../../../contexts/DialogContext';
import type { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  DeleteHolidayCalendarAdminDocument,
  DeleteHolidayDayAdminDocument,
  HolidaysInCalendarDocument,
  UpsertHolidayCalendarAdminDocument,
  UpsertHolidayDayAdminDocument,
  type HolidaysInCalendarQuery,
} from '../../../api/graphql/graphql';
import {
  createCalendarForm,
  createHolidayForm,
  DELETE_HOLIDAY_CALENDAR_DIALOG,
  DELETE_HOLIDAY_DIALOG,
  HOLIDAY_LIMIT,
  nullableText,
} from '../leaveSettingsUtils';

interface UseAdminLeaveHolidaysArgs {
  client: ReturnType<typeof useGraphClient>;
  confirm: ReturnType<typeof useDialogs>['confirm'];
  currentYear: number;
  refresh: () => Promise<void>;
  setError: (message: string | null) => void;
}

export function useAdminLeaveHolidays({
  client,
  confirm,
  currentYear,
  refresh,
  setError,
}: UseAdminLeaveHolidaysArgs) {
  const [calendarModal, setCalendarModal] = useState(false);
  const [holidayModal, setHolidayModal] = useState(false);
  const [calendarForm, setCalendarForm] = useState(createCalendarForm(currentYear));
  const [holidayForm, setHolidayForm] = useState(createHolidayForm());
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [holidayDays, setHolidayDays] = useState<HolidaysInCalendarQuery['holidaysInCalendar']>([]);
  const [holidayLoading, setHolidayLoading] = useState(false);

  const reloadHolidays = useCallback(
    async (calendarId: string) => {
      const result = await client.request<HolidaysInCalendarQuery>(HolidaysInCalendarDocument, {
        calendarId,
        limit: HOLIDAY_LIMIT,
      });
      setHolidayDays(result.holidaysInCalendar);
    },
    [client]
  );

  useEffect(() => {
    if (!selectedCalendarId) {
      setHolidayDays([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        setHolidayLoading(true);
        const result = await client.request<HolidaysInCalendarQuery>(HolidaysInCalendarDocument, {
          calendarId: selectedCalendarId,
          limit: HOLIDAY_LIMIT,
        });
        if (!cancelled) {
          setError(null);
          setHolidayDays(result.holidaysInCalendar);
        }
      } catch (err) {
        if (!cancelled) {
          setHolidayDays([]);
          setError(graphQlUserMessage(err));
        }
      } finally {
        if (!cancelled) setHolidayLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, selectedCalendarId, setError]);

  const saveCalendar = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await client.request(UpsertHolidayCalendarAdminDocument, {
        input: {
          id: null,
          name: calendarForm.name.trim(),
          year: Number(calendarForm.year),
          locationId: nullableText(calendarForm.locationId),
        },
      });
      setCalendarModal(false);
      setCalendarForm(createCalendarForm(currentYear));
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const deleteCalendar = async (id: string) => {
    const ok = await confirm(DELETE_HOLIDAY_CALENDAR_DIALOG);
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteHolidayCalendarAdminDocument, { calendarId: id });
      if (selectedCalendarId === id) setSelectedCalendarId(null);
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const saveHoliday = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCalendarId) return;
    try {
      setError(null);
      await client.request(UpsertHolidayDayAdminDocument, {
        input: {
          calendarId: selectedCalendarId,
          id: null,
          holidayDate: holidayForm.holidayDate,
          name: holidayForm.name.trim(),
          holidayType: nullableText(holidayForm.holidayType),
        },
      });
      setHolidayModal(false);
      setHolidayForm(createHolidayForm());
      await reloadHolidays(selectedCalendarId);
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const deleteHoliday = async (holidayId: string) => {
    const ok = await confirm(DELETE_HOLIDAY_DIALOG);
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteHolidayDayAdminDocument, { holidayId });
      if (selectedCalendarId) await reloadHolidays(selectedCalendarId);
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  return {
    calendarModal,
    setCalendarModal,
    holidayModal,
    setHolidayModal,
    calendarForm,
    setCalendarForm,
    holidayForm,
    setHolidayForm,
    selectedCalendarId,
    setSelectedCalendarId,
    holidayDays,
    holidayLoading,
    saveCalendar,
    deleteCalendar,
    saveHoliday,
    deleteHoliday,
  };
}
