import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import siteConfig from '@/data/site-config.json';
import PageMeta from '@/components/PageMeta';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { WaveDivider } from '@/components/WaveDivider';

type FormState = 'idle' | 'sending' | 'success' | 'error' | 'ratelimit';

const RATE_KEY = 'filadelfia_contact_sends';
const MAX_PER_HOUR = 2;

function checkRateLimit(): boolean {
  try {
    const stored = localStorage.getItem(RATE_KEY);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recent = timestamps.filter(t => t > oneHourAgo);
    return recent.length < MAX_PER_HOUR;
  } catch {
    return true;
  }
}

function recordSend() {
  try {
    const stored = localStorage.getItem(RATE_KEY);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recent = timestamps.filter(t => t > oneHourAgo);
    localStorage.setItem(RATE_KEY, JSON.stringify([...recent, Date.now()]));
  } catch {}
}

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<FormState>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!checkRateLimit()) { setFormState('ratelimit'); return; }
    setFormState('sending');
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current!,
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
      );
      recordSend();
      setFormState('success');
      formRef.current?.reset();
    } catch {
      setFormState('error');
    }
  };

  return (
    <div>
      <PageMeta title="Contact — Filadelfia" description="Contactează-ne. Suntem pe Str. 9 Mai, Petroșani, Hunedoara." />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="hidden sm:block absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>
        <Container className="relative text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Vino să ne cunoști</p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: '#d4ab84' }}>Contact</h1>
          <p className="mx-auto mt-4 max-w-lg text-xl leading-8 text-slate-300">
            Alege metoda de contact care ți se potrivește și ne vom întâlni cu bucurie.
          </p>
        </Container>
      </section>

      {/* ── Contact + Map ── */}
      <section className="relative py-20 sm:py-24 bg-[#d4ab84]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 -translate-y-full">
          <WaveDivider bottomColor="#d4ab84" height={70} />
        </div>
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">

            {/* Card header */}
            <div className="border-b border-slate-100 px-4 py-6 sm:px-10 sm:py-8 text-center">
              <p className="text-base font-semibold uppercase tracking-[0.3em]" style={{ color: '#d4ab84' }}>Hai să ne cunoaștem</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">Informații & Locație</h2>
            </div>

            {/* Card body — 2 columns */}
            <div className="grid divide-x divide-slate-100 lg:grid-cols-2">

              {/* LEFT — Contact info */}
              <div className="p-4 sm:p-10 space-y-8">

                {/* Pastors */}
                <div>
                  <p className="mb-3 text-base font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Conducere</p>
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
                        <p className="mt-1 text-base font-bold text-slate-900">Daniel Nemeș</p>
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

                <div className="border-t border-slate-100" />

                {/* Secretariat */}
                <div>
                  <p className="mb-3 text-base font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Secretariat</p>
                  <div className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Secretar</p>
                        <p className="mt-1 text-base font-bold text-slate-900">Marko Kiss</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <a
                          href="tel:+40769653161"
                          className="shrink-0 rounded-full bg-secondary/10 border border-secondary/20 px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-secondary/20"
                        >
                          0769 653 161
                        </a>
                        <a
                          href="mailto:biserica.filadelfia96@gmail.com"
                          className="shrink-0 rounded-full bg-secondary/10 border border-secondary/20 px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-secondary/20"
                        >
                          biserica.filadelfia96@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div>
                  <p className="mb-3 text-base font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Urmărește-ne</p>
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

              {/* RIGHT — Address + Map */}
              <div className="p-4 sm:p-10 space-y-6">
                {/* Address */}
                <div>
                  <p className="mb-3 text-base font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Adresă</p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-7 py-5 text-center">
                    <p className="text-lg font-semibold text-slate-800">{siteConfig.contact.address}</p>
                  </div>
                </div>

                <p className="mb-3 text-base font-bold uppercase tracking-[0.3em] text-slate-700 text-center">Harta locației</p>
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

      {/* ── Formular contact ── */}
      <section className="pb-20 sm:pb-24 bg-[#d4ab84]">
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-6 sm:px-10 sm:py-8 text-center">
              <p className="text-base font-semibold uppercase tracking-[0.3em]" style={{ color: '#d4ab84' }}>Scrie-ne</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">Trimite un mesaj</h2>
              <p className="mt-3 text-slate-500 text-base">Îți vom răspunde în cel mai scurt timp posibil.</p>
            </div>

            <div className="p-4 sm:p-10 max-w-2xl mx-auto">
              {formState === 'success' ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Mesaj trimis!</h3>
                  <p className="text-slate-500 max-w-sm">Îți mulțumim. Te vom contacta în cel mai scurt timp posibil.</p>
                  <button onClick={() => setFormState('idle')} className="mt-2 text-sm font-semibold text-secondary hover:underline">
                    Trimite alt mesaj
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nume</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Numele tău"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="email@exemplu.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Mesaj</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Scrie mesajul tău aici..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    />
                  </div>
                  {formState === 'error' && (
                    <p className="text-sm font-semibold text-red-500">A apărut o eroare. Încearcă din nou sau contactează-ne telefonic.</p>
                  )}
                  {formState === 'ratelimit' && (
                    <p className="text-sm font-semibold text-amber-600">Ai trimis prea multe mesaje într-o oră. Te rugăm să încerci mai târziu.</p>
                  )}
                  <Button
                    type="submit"
                    disabled={formState === 'sending'}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    {formState === 'sending' ? 'Se trimite...' : 'Trimite mesajul'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
