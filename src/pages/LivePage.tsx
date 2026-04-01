import LivePlayer from '@/components/LivePlayer';
import PageMeta from '@/components/PageMeta';
import Container from '@/components/ui/container';
import { WaveDivider } from '@/components/WaveDivider';

export default function LivePage() {
  return (
    <div>
      <PageMeta title="Live — Biserica Filadelfia" description="Urmărește transmisia noastră live." />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="hidden sm:block absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>
        <Container className="relative text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Transmisie în direct</p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: '#d4ab84' }}>Live</h1>
          <p className="mx-auto mt-4 max-w-lg text-xl leading-8 text-slate-300">
            Te invităm să urmărești programele noastre în direct.
          </p>
        </Container>
      </section>
      <WaveDivider bottomColor="#d4ab84" height={70} />
      {/* ── Player ── */}
      <section className="py-20 sm:py-24 bg-[#d4ab84]">
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-6 sm:px-10 sm:py-8 text-center">
              <p className="text-base font-semibold uppercase tracking-[0.3em]" style={{ color: '#d4ab84' }}>Transmisie</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">Ultimul program înregistrat</h2>
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
