import { groupByDay } from '@/utils/schedule';
import schedule from '@/data/schedule.json';
import LivePlayer from '@/components/LivePlayer';
import PageMeta from '@/components/PageMeta';
import Container from '@/components/ui/container';
import Badge from '@/components/ui/badge';

export default function LivePage() {
  const groups = groupByDay(schedule.services);

  return (
    <div>
      <PageMeta title="Live — Biserica Filadelfia" description="Urmărește transmisia noastră live și vezi programul serviciilor." />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[400px] w-[600px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>
        <Container className="relative space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            <span className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            </span>
            Transmisie live
          </h1>
          <p className="max-w-lg text-xl leading-8 text-slate-300">
            Urmărește predicile noastre directe și stai la curent cu programul serviciilor.
          </p>
        </Container>
      </section>

      {/* ── Player + Schedule ── */}
      <section className="py-20 sm:py-24 bg-slate-200">
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">

            {/* Card header */}
            <div className="border-b border-slate-100 px-10 py-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Transmisie</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Live & Program</h2>
            </div>

            {/* Card body — 2 columns */}
            <div className="grid divide-x divide-slate-100 lg:grid-cols-[1.5fr_0.5fr]">

              {/* LEFT — Player */}
              <div className="p-10">
                <LivePlayer autoplay />
              </div>

              {/* RIGHT — Schedule */}
              <div className="p-10 space-y-6">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Programul serviciilor</p>
                <div className="space-y-4">
                  {groups.map(group => (
                    <div key={group.dayOfWeek}>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{group.dayLabel}</h3>
                      <div className="space-y-2">
                        {group.services.map(service => (
                          <div key={service.id} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-slate-900">{service.title}</p>
                              {service.isLive ? <Badge>Live</Badge> : null}
                            </div>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              {service.time}{service.endTime ? ` – ${service.endTime}` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
