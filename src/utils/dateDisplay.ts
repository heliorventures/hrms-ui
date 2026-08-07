const DEFAULT_DATE_LOCALE = 'en-IN';

export const formatDisplayDate = (value: string | Date, locale = DEFAULT_DATE_LOCALE) =>
  new Date(value).toLocaleDateString(locale);

export const formatDisplayDateTime = (value: string | Date, locale = DEFAULT_DATE_LOCALE) =>
  new Date(value).toLocaleString(locale);
