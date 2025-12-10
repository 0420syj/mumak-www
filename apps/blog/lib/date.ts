export interface FormattedDate {
  text: string;
  dateTime: string;
}

export const DEFAULT_FORMATTED_DATE: FormattedDate = {
  text: '—',
  dateTime: '',
};

/**
 * Format a date string with locale-aware output and a stable UTC timezone to avoid
 * environment-dependent day shifts.
 */
export function formatDateForLocale(value: string | undefined, locale: string): FormattedDate {
  if (!value) {
    return DEFAULT_FORMATTED_DATE;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return DEFAULT_FORMATTED_DATE;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    text: formatter.format(date),
    dateTime: value,
  };
}
