import siteConfig from '@/data/site-config.json';
import PageMeta from '@/components/PageMeta';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div>
      <PageMeta title="Contact — Filadelfia" description="Contactează-ne. Suntem pe Str. 9 Mai, Petroșani, Hunedoara." />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="hidden sm:block absolute right-1/3 top-0 h-[400px] w-[600px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>
        <Container className="relative space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Suntem aici pentru tine
          </h1>
          <p className="max-w-lg text-xl leading-8 text-slate-300">
            Alege metoda de contact care ți se potrivește și ne vom întâlni cu bucurie.
          </p>
        </Container>
      </section>

      {/* ── Contact + Map ── */}
      <section className="py-20 sm:py-24 bg-[#d4ab84]">
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">

            {/* Card header */}
            <div className="border-b border-slate-100 px-4 py-6 sm:px-10 sm:py-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Hai să ne cunoaștem</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Informații & Locație</h2>
            </div>

            {/* Card body — 2 columns */}
            <div className="grid divide-x divide-slate-100 lg:grid-cols-2">

              {/* LEFT — Contact info */}
              <div className="p-4 sm:p-10 space-y-8">

                {/* Address */}
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Adresă</p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-7 py-5 text-center">
                    <p className="text-lg font-semibold text-slate-800">{siteConfig.contact.address}</p>
                  </div>
                </div>

                {/* Pastors */}
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Conducere</p>
                  <div className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pastor principal</p>
                        <p className="mt-1 text-base font-bold text-slate-900">Gheorghe Coicheci</p>
                      </div>
                      <a
                        href="tel:+40730266437"
                        className="shrink-0 rounded-full bg-secondary/10 border border-secondary/20 px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-secondary/20"
                      >
                        0730 266 437
                      </a>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pastor asistent</p>
                        <p className="mt-1 text-base font-bold text-slate-900">Daniel Nemes</p>
                      </div>
                      <a
                        href="tel:+40721255379"
                        className="shrink-0 rounded-full bg-secondary/10 border border-secondary/20 px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-secondary/20"
                      >
                        0721 255 379
                      </a>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Urmărește-ne</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {siteConfig.social.youtube && (
                      <Button asChild size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
                      </Button>
                    )}
                    {siteConfig.social.facebook && (
                      <Button asChild size="sm" variant="ghost" className="border border-slate-200 hover:bg-slate-100 text-slate-700">
                        <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT — Map */}
              <div className="p-4 sm:p-10">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Harta locației</p>
                {siteConfig.contact.mapEmbedUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <iframe
                      src={siteConfig.contact.mapEmbedUrl}
                      title="Locație pe hartă"
                      width="100%"
                      className="h-48 sm:h-[420px]"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 p-10 text-center space-y-4 h-full">
                    <div className="text-4xl">📍</div>
                    <Button asChild size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(siteConfig.contact.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Deschide Google Maps
                      </a>
                    </Button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
