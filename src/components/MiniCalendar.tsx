import { useState } from 'react';

interface CalEvent {
  date: string;
  title: string;
}

interface MiniCalendarProps {
  events: CalEvent[];
  holidays?: CalEvent[];
}

const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
];
const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];

export default function MiniCalendar({ events, holidays = [] }: MiniCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;

  const eventDays = new Set(
    events
      .filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(e => new Date(e.date).getDate()),
  );

  const holidayMap = new Map<number, string>(
    holidays
      .filter(h => {
        const d = new Date(h.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(h => [new Date(h.date).getDate(), h.title]),
  );

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  return (
    <div>
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
          aria-label="Luna anterioară"
        >
          ‹
        </button>
        <span className="text-base font-bold text-slate-800">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
          aria-label="Luna următoare"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7">
        {DAY_NAMES.map((d, idx) => (
          <div
            key={d}
            className={`py-1 text-center text-[0.7rem] font-bold uppercase tracking-wider ${
              idx === 5 || idx === 6 ? 'text-secondary/70' : 'text-slate-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const hasEvent = eventDays.has(day);
          const holidayName = holidayMap.get(day);
          const col = i % 7;
          const isWeekend = col === 5 || col === 6;

          return (
            <div
              key={day}
              className={`relative flex h-9 flex-col items-center justify-center rounded-xl text-sm font-semibold transition cursor-default ${
                isToday && hasEvent
                  ? 'bg-red-500 text-white shadow-md shadow-red-200'
                  : isToday
                  ? 'bg-secondary text-secondary-foreground shadow-md shadow-secondary/30'
                  : hasEvent
                  ? 'bg-red-50 text-red-600 font-bold hover:bg-red-100'
                  : holidayName
                  ? 'bg-amber-50 text-amber-700 font-bold hover:bg-amber-100'
                  : isWeekend
                  ? 'text-secondary/80 hover:bg-secondary/10 hover:shadow-sm'
                  : 'text-slate-700 hover:bg-white hover:shadow-sm'
              }`}
            >
              {day}
              {hasEvent && !isToday && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-red-400" />
              )}
              {hasEvent && isToday && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-white/60" />
              )}
              {holidayName && !hasEvent && !isToday && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
          Astăzi
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          Eveniment
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          Sărbătoare
        </span>
      </div>

      {/* Holidays this month */}
      {holidayMap.size > 0 && (
        <div className="mt-4 space-y-1.5">
          {Array.from(holidayMap.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([day, name]) => (
              <div key={day} className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                <span className="text-xs font-semibold text-amber-800">{day} {MONTH_NAMES[month]}</span>
                <span className="text-xs text-amber-700">— {name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
