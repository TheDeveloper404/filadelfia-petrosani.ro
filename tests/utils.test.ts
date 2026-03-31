import { describe, it, expect } from 'vitest';
import { getDayOfYear, getVerseOfTheDay } from '../src/utils/verse';
import {
  formatDateRo,
  isUpcoming,
  daysUntil,
  getReadingPlanDayIndex,
  dayNameRo,
} from '../src/utils/date';

// ============================================================
// verse utils
// ============================================================

describe('getDayOfYear', () => {
  it('returns 1 for January 1', () => {
    expect(getDayOfYear(new Date('2025-01-01T12:00:00'))).toBe(1);
  });

  it('returns 32 for February 1', () => {
    expect(getDayOfYear(new Date('2025-02-01T12:00:00'))).toBe(32);
  });

  it('returns 365 for December 31 in a non-leap year', () => {
    expect(getDayOfYear(new Date('2025-12-31T12:00:00'))).toBe(365);
  });

  it('returns 366 for December 31 in a leap year', () => {
    expect(getDayOfYear(new Date('2024-12-31T12:00:00'))).toBe(366);
  });
});

describe('getVerseOfTheDay', () => {
  const verses = [
    { text: 'Verse A', reference: 'Ref A' },
    { text: 'Verse B', reference: 'Ref B' },
    { text: 'Verse C', reference: 'Ref C' },
  ];

  it('returns a verse for a given date', () => {
    const result = getVerseOfTheDay(verses, new Date('2025-01-01T12:00:00'));
    expect(result).toBeDefined();
    expect(result.text).toBeTruthy();
    expect(result.reference).toBeTruthy();
  });

  it('returns the same verse for the same date', () => {
    const date = new Date('2025-06-15T12:00:00');
    const a = getVerseOfTheDay(verses, date);
    const b = getVerseOfTheDay(verses, date);
    expect(a).toStrictEqual(b);
  });

  it('cycles through the array (modulo)', () => {
    // With 3 verses, day 1 → index 1%3=1, day 4 → index 4%3=1 (same)
    const d1 = getVerseOfTheDay(verses, new Date('2025-01-01T12:00:00')); // day=1, 1%3=1
    const d4 = getVerseOfTheDay(verses, new Date('2025-01-04T12:00:00')); // day=4, 4%3=1
    expect(d1).toStrictEqual(d4);
  });

  it('returns empty verse for empty array', () => {
    const result = getVerseOfTheDay([], new Date());
    expect(result.text).toBe('');
    expect(result.reference).toBe('');
  });
});

// ============================================================
// date utils
// ============================================================

describe('formatDateRo', () => {
  it('formats a date string in Romanian', () => {
    const result = formatDateRo('2025-03-23');
    // Should contain the year and day number
    expect(result).toContain('2025');
    expect(result).toContain('23');
  });

  it('formats a different date', () => {
    const result = formatDateRo('2025-01-01');
    expect(result).toContain('2025');
    expect(result).toContain('1');
  });
});

describe('isUpcoming', () => {
  it('returns true for a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const dateStr = future.toISOString().split('T')[0]!;
    expect(isUpcoming(dateStr)).toBe(true);
  });

  it('returns false for a past date', () => {
    expect(isUpcoming('2020-01-01')).toBe(false);
  });

  it('returns true for today', () => {
    const today = new Date().toISOString().split('T')[0]!;
    expect(isUpcoming(today)).toBe(true);
  });
});

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    const today = new Date().toISOString().split('T')[0]!;
    expect(daysUntil(today)).toBe(0);
  });

  it('returns 7 for 7 days from now', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const dateStr = future.toISOString().split('T')[0]!;
    expect(daysUntil(dateStr)).toBe(7);
  });

  it('returns negative for past dates', () => {
    expect(daysUntil('2020-01-01')).toBeLessThan(0);
  });
});

describe('getReadingPlanDayIndex', () => {
  it('returns 0 when today equals start date', () => {
    const today = new Date().toISOString().split('T')[0]!;
    expect(getReadingPlanDayIndex(today, 365)).toBe(0);
  });

  it('clamps to 0 for a start date in the future', () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const futureStr = future.toISOString().split('T')[0]!;
    expect(getReadingPlanDayIndex(futureStr, 365)).toBe(0);
  });

  it('wraps around (modulo) when past end of plan', () => {
    // Exactly 365 days past start → full cycle → back to day 0
    const start365 = new Date();
    start365.setDate(start365.getDate() - 365);
    const str365 = start365.toISOString().split('T')[0]!;
    expect(getReadingPlanDayIndex(str365, 365)).toBe(0);

    // Exactly 366 days past start → one day into second cycle → day 1
    const start366 = new Date();
    start366.setDate(start366.getDate() - 366);
    const str366 = start366.toISOString().split('T')[0]!;
    expect(getReadingPlanDayIndex(str366, 365)).toBe(1);
  });

  it('returns correct index for a known offset', () => {
    const start = new Date();
    start.setDate(start.getDate() - 10);
    const startStr = start.toISOString().split('T')[0]!;
    expect(getReadingPlanDayIndex(startStr, 365)).toBe(10);
  });
});

describe('dayNameRo', () => {
  it('returns Duminică for 0', () => expect(dayNameRo(0)).toBe('Duminică'));
  it('returns Luni for 1', () => expect(dayNameRo(1)).toBe('Luni'));
  it('returns Joi for 4', () => expect(dayNameRo(4)).toBe('Joi'));
  it('returns Sâmbătă for 6', () => expect(dayNameRo(6)).toBe('Sâmbătă'));
  it('returns empty string for invalid day', () => expect(dayNameRo(7)).toBe(''));
});
