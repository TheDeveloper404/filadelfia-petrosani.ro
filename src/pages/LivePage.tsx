import LivePlayer from '@/components/LivePlayer';
import PageMeta from '@/components/PageMeta';
import Container from '@/components/ui/container';

export default function LivePage() {
  return (
    <div>
      <PageMeta title="Live — Biserica Filadelfia" description="Urmărește transmisia noastră live." />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="hidden sm:block absolute left-1/4 top-0 h-[400px] w-[600px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>
        <Container className="relative space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Transmisie live
          </h1>
          <p className="max-w-lg text-xl leading-8 text-slate-300">
            Urmărește predicile noastre în direct.
          </p>
        </Container>
      </section>

      {/* ── Player ── */}
      <section className="py-20 sm:py-24 bg-slate-200">
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-6 sm:px-10 sm:py-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Transmisie</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Live</h2>
            </div>
            <div className="p-4 sm:p-10">
              <LivePlayer autoplay />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
