import { describe, it, expect } from 'vitest';
import { groupByDay, getNextService } from '../src/utils/schedule';

const SERVICES = [
  { id: 'sunday-morning', dayOfWeek: 0, dayLabel: 'Duminică', time: '09:00', endTime: '12:00', title: 'Serviciu divin', isLive: true },
  { id: 'sunday-evening', dayOfWeek: 0, dayLabel: 'Duminică', time: '18:00', endTime: '20:00', title: 'Serviciu divin', isLive: true },
  { id: 'wednesday',      dayOfWeek: 3, dayLabel: 'Miercuri', time: '18:00', endTime: '19:00', title: 'Rugăciune',       isLive: false },
  { id: 'thursday',       dayOfWeek: 4, dayLabel: 'Joi',      time: '18:00', endTime: '20:00', title: 'Rugăciune și studiu biblic', isLive: false },
];

// ============================================================
// groupByDay
// ============================================================
describe('groupByDay', () => {
  it('groups services by dayOfWeek', () => {
    const groups = groupByDay(SERVICES);
    expect(groups.length).toBe(3); // Sunday, Wednesday, Thursday
  });

  it('sorts groups by dayOfWeek ascending', () => {
    const groups = groupByDay(SERVICES);
    expect(groups[0]!.dayOfWeek).toBe(0); // Sunday
    expect(groups[1]!.dayOfWeek).toBe(3); // Wednesday
    expect(groups[2]!.dayOfWeek).toBe(4); // Thursday
  });

  it('puts both Sunday services in the same group', () => {
    const groups = groupByDay(SERVICES);
    const sunday = groups.find(g => g.dayOfWeek === 0)!;
    expect(sunday.services.length).toBe(2);
  });

  it('returns empty array for empty input', () => {
    expect(groupByDay([])).toEqual([]);
  });

  it('preserves dayLabel', () => {
    const groups = groupByDay(SERVICES);
    expect(groups[0]!.dayLabel).toBe('Duminică');
    expect(groups[2]!.dayLabel).toBe('Joi');
  });
});

// ============================================================
// getNextService
// ============================================================
describe('getNextService', () => {
  it('returns null for empty services', () => {
    expect(getNextService([], new Date())).toBeNull();
  });

  it('returns the ongoing service during its window', () => {
    // Sunday 10:00 — inside sunday-morning (09:00–12:00)
    const now = new Date('2026-03-29T10:00:00');
    const result = getNextService(SERVICES, now)!;
    expect(result.service.id).toBe('sunday-morning');
    expect(result.isOngoing).toBe(true);
    expect(result.daysUntil).toBe(0);
  });

  it('returns the next service later the same day', () => {
    // Sunday 13:00 — morning finished, next is sunday-evening at 18:00
    const now = new Date('2026-03-29T13:00:00');
    const result = getNextService(SERVICES, now)!;
    expect(result.service.id).toBe('sunday-evening');
    expect(result.isOngoing).toBe(false);
    expect(result.daysUntil).toBe(0);
  });

  it('wraps to the next week when all services have passed', () => {
    // Friday 22:00 — no more services this week, wraps to Sunday morning
    const now = new Date('2026-04-03T22:00:00'); // Friday
    const result = getNextService(SERVICES, now)!;
    expect(result.service.id).toBe('sunday-morning');
    expect(result.daysUntil).toBe(2); // Friday → Sunday
  });

  it('returns daysUntil=0 for a service starting later today', () => {
    // Thursday 17:00 — thursday service starts at 18:00
    const now = new Date('2026-04-02T17:00:00');
    const result = getNextService(SERVICES, now)!;
    expect(result.service.id).toBe('thursday');
    expect(result.daysUntil).toBe(0);
    expect(result.isOngoing).toBe(false);
  });

  it('does not return a service that has already ended today', () => {
    // Sunday 21:00 — both Sunday services finished, next is Wednesday
    const now = new Date('2026-03-29T21:00:00');
    const result = getNextService(SERVICES, now)!;
    expect(result.service.id).toBe('wednesday');
    expect(result.daysUntil).toBe(3); // Sunday → Wednesday
  });

  it('returns isOngoing=false when service has not started yet', () => {
    // Sunday 08:00 — morning service starts at 09:00
    const now = new Date('2026-03-29T08:00:00');
    const result = getNextService(SERVICES, now)!;
    expect(result.service.id).toBe('sunday-morning');
    expect(result.isOngoing).toBe(false);
  });
});
