export interface Verse {
  text: string;
  reference: string;
}

/**
 * Returns the day-of-year (1–365/366) for a given date.
 * Used to pick a stable verse that doesn't change within the same day.
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / msPerDay);
}

/**
 * Returns a deterministic verse for the given date.
 * The same date always returns the same verse; it rotates through the array yearly.
 */
export function getVerseOfTheDay(verses: Verse[], date: Date = new Date()): Verse {
  if (verses.length === 0) {
    return { text: '', reference: '' };
  }
  const day = getDayOfYear(date);
  return verses[day % verses.length]!;
}
