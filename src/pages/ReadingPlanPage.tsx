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
    container.scrollBy({ top: row.getBoundingClientRect().top - container.getBoundingClientRect().top - container.clientHeight / 2 + row.clientHeight / 2, behavior });
  };

  useEffect(() => { scrollToToday('instant'); }, []);

  return (
    <div>
      <PageMeta title="Plan de citire — Filadelfia" description="Plan anual de citire biblică pentru ziua de astăzi și următoarele zile." />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="hidden sm:block absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>
        <Container className="relative text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Lectură zilnică</p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: '#d4ab84' }}>{plan.planName}</h1>
          <p className="mx-auto mt-4 max-w-xl text-xl leading-8 text-slate-300">
            Citește Biblia și vei deveni mai înțelept, crede-o ca să fii în siguranță și aplică-o, ca să trăiești o viață adevărată!
          </p>
        </Container>
      </section>

      {/* ── Plan ── */}
      <section className="py-20 sm:py-24 bg-[#d4ab84]">
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">

            {/* Card header */}
            <div className="border-b border-slate-100 px-4 py-6 sm:px-10 sm:py-8 text-center">
              <p className="text-base font-semibold uppercase tracking-[0.3em]" style={{ color: '#d4ab84' }}>Lectură zilnică</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">Fii la zi cu citirea Cuvântului lui Dumnezeu</h2>
            </div>

            {/* Two columns */}
            <div className="grid divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">

              {/* LEFT — today */}
              <div className="flex flex-col items-center justify-center gap-6 p-8 sm:p-12 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{todayLabel}</p>
                <p className="text-5xl font-bold text-slate-900 leading-tight">
                  {todayReading ? (todayReading as any).reading : '—'}
                </p>
                <p className="text-sm text-slate-400">Ziua {dayIndex + 1} din {plan.readings.length}</p>

                {/* Progress */}
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>Progres</span>
                    <span className="text-secondary">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-secondary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => scrollToToday('smooth')}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
                >
                  Mergi la ziua de azi
                </button>
              </div>

              {/* RIGHT — list */}
              <div className="p-4 sm:p-8">
                <div ref={listRef} className="max-h-[420px] overflow-y-auto space-y-1 pr-1">
                  {plan.readings.map((row, index) => {
                    const isToday = index === dayIndex;
                    const isPast = index < dayIndex;
                    return (
                      <div
                        key={index}
                        id={isToday ? 'today-row' : undefined}
                        className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 transition ${
                          isToday ? 'border-secondary/40 bg-secondary/5' : isPast ? 'border-slate-100 bg-slate-50 opacity-50' : 'border-slate-100 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 w-14 shrink-0">Ziua {index + 1}</span>
                          <span className={`text-sm font-semibold ${isToday ? 'text-slate-900' : 'text-slate-700'}`}>
                            {(row as any).reading}
                          </span>
                        </div>
                        {isToday ? <Badge>Astăzi</Badge> : isPast ? <span className="text-slate-400 text-sm">✓</span> : null}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
