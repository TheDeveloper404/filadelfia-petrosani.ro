import { useEffect, useRef } from 'react';
import plan from '@/data/reading-plan.json';
import PageMeta from '@/components/PageMeta';
import { formatDateRo, getReadingPlanDayIndex } from '@/utils/date';
import Container from '@/components/ui/container';
import Badge from '@/components/ui/badge';

export default function ReadingPlanPage() {
  const dayIndex = getReadingPlanDayIndex(plan.startDate, plan.readings.length);
  const todayReading = plan.readings[dayIndex];
  const todayLabel = formatDateRo(new Date().toISOString().split('T')[0]!);
  const progress = Math.round(((dayIndex + 1) / plan.readings.length) * 100);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToToday = (behavior: ScrollBehavior = 'smooth') => {
    const container = listRef.current;
    const row = document.getElementById('today-row');
    if (!container || !row) return;
    const containerTop = container.getBoundingClientRect().top;
    const rowTop = row.getBoundingClientRect().top;
    container.scrollBy({ top: rowTop - containerTop - container.clientHeight / 2 + row.clientHeight / 2, behavior });
  };

  useEffect(() => { scrollToToday('instant'); }, []);

  return (
    <div>
      <PageMeta title="Plan de citire — Filadelfia" description="Plan anual de citire biblică pentru ziua de astăzi și următoarele zile." />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-[400px] w-[600px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>
        <Container className="relative space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
{plan.planName}
          </h1>
          <p className="max-w-xl text-xl leading-8 text-slate-300">
            Citește Biblia și vei deveni mai înțelept, crede-o ca să fii în siguranță și aplică-o, ca să trăiești o viață adevărată!
          </p>
          <p className="max-w-xl text-base leading-7 text-slate-400">
            Urmați planul zilnic pentru a parcurge întreaga Biblie într-un an.
          </p>
        </Container>
      </section>

      {/* ── Plan ── */}
      <section className="py-20 sm:py-24 bg-slate-200">
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">

            {/* Card header — today's reading */}
            <div className="px-10 py-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Citire zilnică · {todayLabel}</p>
              <p className="mt-4 text-5xl font-bold text-slate-900">
                {todayReading ? (todayReading as any).reading : '—'}
              </p>
              <p className="mt-3 text-base font-medium text-slate-400">Ziua {dayIndex + 1} din {plan.readings.length}</p>
              <div className="mt-5 mx-auto max-w-sm">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>Progres</span>
                  <span className="text-secondary">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-secondary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <button
                onClick={() => scrollToToday('smooth')}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
              >
                Astăzi
              </button>
            </div>

            {/* Card body — all days scrollable */}
            <div className="px-10 pb-10">
              <div ref={listRef} className="mx-auto max-w-2xl max-h-[420px] overflow-y-auto space-y-2 pr-1">
                {plan.readings.map((row, index) => {
                  const isToday = index === dayIndex;
                  return (
                    <div
                      key={index}
                      id={isToday ? 'today-row' : undefined}
                      className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 transition ${
                        isToday ? 'border-secondary/40 bg-secondary/5' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-14 shrink-0">Ziua {index + 1}</span>
                        <span className="text-sm font-semibold text-slate-800">{(row as any).reading}</span>
                      </div>
                      {isToday ? <Badge>Astăzi</Badge> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
