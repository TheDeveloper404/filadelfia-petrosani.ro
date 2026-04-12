import type scheduleJson from '@/data/schedule.json';

export type Service = (typeof scheduleJson)['services'][number];

export interface DayGroup {
  dayOfWeek: number;
  dayLabel: string;
  services: Service[];
}

export interface NextServiceResult {
  service: Service;
  isOngoing: boolean;
  daysUntil: number; // 0 = today, 1 = tomorrow, …
}

/** Groups a flat services array by dayOfWeek, sorted Sun→Sat. */
export function groupByDay(services: Service[]): DayGroup[] {
  const map = new Map<number, DayGroup>();
  for (const s of services) {
    if (!map.has(s.dayOfWeek)) {
      map.set(s.dayOfWeek, { dayOfWeek: s.dayOfWeek, dayLabel: s.dayLabel, services: [] });
    }
    map.get(s.dayOfWeek)!.services.push(s);
  }
  return [...map.values()].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Returns the next calendar date on which this service occurs.
 * If the service runs today but has already ended, returns next week's date.
 */
export function getServiceNextDate(service: Service, now: Date): Date {
  const todayDay = now.getDay();
  let daysUntil = (service.dayOfWeek - todayDay + 7) % 7;

  // If it's today, check if service already ended — if so, push to next week
  if (daysUntil === 0) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const endMin = service.endTime ? timeToMinutes(service.endTime) : timeToMinutes(service.time) + 60;
    if (endMin <= currentMinutes) daysUntil = 7;
  }

  const date = new Date(now);
  date.setDate(date.getDate() + daysUntil);
  return date;
}

/**
 * Returns the next upcoming (or currently ongoing) service relative to `now`.
 * Wraps around the week — always finds something for a recurring schedule.
 */
export function getNextService(services: Service[], now: Date): NextServiceResult | null {
  if (!services.length) return null;

  const sorted = [...services].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.time.localeCompare(b.time);
  });

  const currentDay = now.getDay(); // 0 = Sunday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 7; offset++) {
    const targetDay = (currentDay + offset) % 7;
    const dayServices = sorted.filter(s => s.dayOfWeek === targetDay);

    for (const s of dayServices) {
      if (offset === 0) {
        const endMin = s.endTime ? timeToMinutes(s.endTime) : timeToMinutes(s.time) + 60;
        if (endMin <= currentMinutes) continue; // already finished
        return {
          service: s,
          isOngoing: timeToMinutes(s.time) <= currentMinutes,
          daysUntil: 0,
        };
      }
      return { service: s, isOngoing: false, daysUntil: offset };
    }
  }

  return null;
}
