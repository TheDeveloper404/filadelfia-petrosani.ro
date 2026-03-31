export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  short: string;
}

/**
 * Calculates Orthodox Easter date for a given year using the
 * Julian calendar (Meeus algorithm) converted to Gregorian (+13 days for 21st century).
 */
export function getOrthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 3=March, 4=April
  const day = ((d + e + 114) % 31) + 1;
  // Convert Julian → Gregorian: +13 days (valid for 1900–2099)
  return new Date(year, month - 1, day + 13);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * Returns all notable Christian holidays for a given year.
 */
export function getHolidays(year: number): Holiday[] {
  const easter = getOrthodoxEaster(year);

  return [
    { date: `${year}-01-01`, name: 'Anul Nou',         short: 'Anul Nou' },
    { date: `${year}-01-06`, name: 'Boboteaza',         short: 'Boboteaza' },
    { date: fmt(addDays(easter, -7)),  name: 'Floriile',   short: 'Floriile' },
    { date: fmt(addDays(easter, -2)),  name: 'Vinerea Mare', short: 'Vinerea Mare' },
    { date: fmt(easter),               name: 'Paștele',    short: 'Paștele' },
    { date: fmt(addDays(easter, 1)),   name: 'Paștele (a 2-a zi)', short: 'Paștele' },
    { date: fmt(addDays(easter, 39)),  name: 'Înălțarea Domnului', short: 'Înălțarea' },
    { date: fmt(addDays(easter, 49)),  name: 'Rusaliile',  short: 'Rusaliile' },
    { date: fmt(addDays(easter, 50)),  name: 'Rusaliile (a 2-a zi)', short: 'Rusaliile' },
    { date: `${year}-08-15`, name: 'Adormirea Maicii Domnului', short: 'Sf. Maria' },
    { date: `${year}-12-25`, name: 'Crăciunul',         short: 'Crăciunul' },
    { date: `${year}-12-26`, name: 'Crăciunul (a 2-a zi)', short: 'Crăciunul' },
  ];
}

/**
 * Returns a Map<"YYYY-MM-DD", Holiday> for fast lookup in calendar rendering.
 */
export function getHolidayMap(year: number): Map<string, Holiday> {
  const map = new Map<string, Holiday>();
  for (const h of getHolidays(year)) {
    map.set(h.date, h);
  }
  return map;
}
