/**
 * Parses a YYYY-MM-DD string into a UTC midnight Date.
 */
function parseUtcDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function utcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Returns a Romanian-formatted date string.
 * e.g. "23 martie 2025"
 */
export function formatDateRo(dateString: string): string {
  const date = parseUtcDate(dateString);
  return date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Returns a short Romanian-formatted date string.
 * e.g. "23 mar. 2025"
 */
export function formatDateShortRo(dateString: string): string {
  const date = parseUtcDate(dateString);
  return date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Checks whether an event date is in the future (or today).
 */
export function isUpcoming(dateString: string): boolean {
  const today = utcMidnight(new Date());
  const eventDate = parseUtcDate(dateString);
  return eventDate >= today;
}

/**
 * Returns the number of days until an event (0 = today, negative = past).
 */
export function daysUntil(dateString: string): number {
  const today = utcMidnight(new Date());
  const eventDate = parseUtcDate(dateString);
  const diff = eventDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Returns the current day index into a reading plan, based on plan start date.
 * Clamps to [0, readings.length - 1].
 */
export function getReadingPlanDayIndex(startDate: string, totalDays: number): number {
  const start = parseUtcDate(startDate);
  const today = utcMidnight(new Date());
  const diff = today.getTime() - start.getTime();
  const dayIndex = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (dayIndex < 0) return 0;
  return dayIndex % totalDays;
}

/**
 * Returns the name of the day of the week in Romanian.
 */
export function dayNameRo(dayOfWeek: number): string {
  const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
  return days[dayOfWeek] ?? '';
}

/**
 * Returns a formatted event date range in Romanian, uppercased.
 * e.g. "DUMINICĂ, 12–13 APRILIE 2026" or "DUMINICĂ, 12 APRILIE 2026"
 */
export function formatEventDateRange(dateStr: string, endDateStr: string | null): string {
  const d = parseUtcDate(dateStr);
  const weekday = d.toLocaleDateString('ro-RO', { weekday: 'long', timeZone: 'UTC' }).toUpperCase();

  if (!endDateStr) {
    const rest = d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
    return `${weekday}, ${rest}`;
  }

  const e = parseUtcDate(endDateStr);
  if (d.getUTCMonth() === e.getUTCMonth() && d.getUTCFullYear() === e.getUTCFullYear()) {
    const monthYear = d.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
    return `${weekday}, ${d.getUTCDate()}–${e.getUTCDate()} ${monthYear}`;
  }

  const startFmt = d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', timeZone: 'UTC' }).toUpperCase();
  const endFmt = e.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
  return `${weekday}, ${startFmt}–${endFmt}`;
}
