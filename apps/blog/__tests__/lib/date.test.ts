import { DEFAULT_FORMATTED_DATE, formatDateForLocale } from '@/lib/date';

describe('formatDateForLocale', () => {
  it('formats ISO date for English locale', () => {
    const formatted = formatDateForLocale('2025-12-06', 'en');

    expect(formatted).toEqual({
      dateTime: '2025-12-06',
      text: 'December 6, 2025',
    });
  });

  it('formats ISO date for Korean locale', () => {
    const formatted = formatDateForLocale('2025-12-06', 'ko');

    expect(formatted).toEqual({
      dateTime: '2025-12-06',
      text: '2025년 12월 6일',
    });
  });

  it('returns default formatted date when the date is invalid', () => {
    expect(formatDateForLocale('invalid-date', 'ko')).toEqual(DEFAULT_FORMATTED_DATE);
    expect(formatDateForLocale('invalid-date', 'en')).toEqual(DEFAULT_FORMATTED_DATE);
    expect(formatDateForLocale(undefined, 'ko')).toEqual(DEFAULT_FORMATTED_DATE);
    expect(formatDateForLocale(undefined, 'en')).toEqual(DEFAULT_FORMATTED_DATE);
  });
});
