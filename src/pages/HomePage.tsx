import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '@/data/site-config.json';
import staticEvents from '@/data/events.json';
import holidays from '@/data/holidays.json';
import schedule from '@/data/schedule.json';
import versesData from '@/data/verses.json';
import { getVerseOfTheDay } from '@/utils/verse';
import { isUpcoming } from '@/utils/date';
import { getNextService } from '@/utils/schedule';
import type { CustomEvent } from '@/pages/AdminPage';
import { dbRead } from '@/lib/db';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import EventCard from '@/components/EventCard';
import MiniCalendar from '@/components/MiniCalendar';
import PageMeta from '@/components/PageMeta';
import VerseOfTheDay from '@/components/VerseOfTheDay';
import { WaveDivider } from '@/components/WaveDivider';

const EVENTS_KEY = 'filadelfia_events';
const SCHEDULE_KEY = 'filadelfia_schedule';

function loadCachedEvents(): CustomEvent[] {
  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function loadCachedSchedule(): typeof schedule.services {
  try {
    const stored = localStorage.getItem(SCHEDULE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return schedule.services;
}

export default function HomePage() {
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>(loadCachedEvents);
  const [services, setServices] = useState<typeof schedule.services>(loadCachedSchedule);
  const [nextService, setNextService] = useState(() => getNextService(schedule.services, new Date()));
  const verse = getVerseOfTheDay(versesData);

  useEffect(() => {
    dbRead<CustomEvent[]>('events').then(remote => {
      if (remote !== undefined) {
        const list = Array.isArray(remote) ? remote : [];
        setCustomEvents(list);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
      }
    });
    dbRead<typeof schedule.services>('schedule').then(remote => {
      if (remote !== undefined && Array.isArray(remote) && remote.length > 0) {
        setServices(remote);
        localStorage.setItem(SCHEDULE_KEY, JSON.stringify(remote));
      }
    });
  }, []);

  // Recalculate next service every minute so the highlight updates without refresh
  useEffect(() => {
    setNextService(getNextService(services, new Date()));
    const interval = setInterval(
      () => setNextService(getNextService(services, new Date())),
      60_000,
    );
    return () => clearInterval(interval);
  }, [services]);

  const allEvents = [...staticEvents, ...customEvents].sort((a, b) => a.date.localeCompare(b.date));
  const upcomingEvents = allEvents.filter(event => isUpcoming(event.date));

  return (
    <div>
      <PageMeta title="Biserica Filadelfia | Petroșani" description={siteConfig.description} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-900 text-white hero-full-height">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[300px] w-[400px] rounded-full bg-secondary/8 blur-[80px] sm:h-[600px] sm:w-[900px] sm:blur-[120px]" />
          <div className="hidden sm:block absolute right-0 bottom-0 h-[400px] w-[500px] rounded-full bg-primary/20 blur-[100px]" />
        </div>

        {/* Mobile — full cover, no mask, cross visible */}
        <div
          className="pointer-events-none absolute inset-0 z-0 sm:hidden"
          style={{
            backgroundImage: 'url(/image_bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: '78% center',
            opacity: 0.25,
          }}
        />
        {/* Desktop — right side with gradient mask */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-2/3 sm:block"
          style={{
            backgroundImage: 'url(/image_bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
          }}
        />

        <Container className="relative py-32 md:py-40">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl" style={{ color: '#d4ab84' }}>
              <span className="block">Biserica Penticostală Filadelfia</span>
              <span className="mt-2 block text-2xl font-light tracking-[0.2em] text-slate-400 sm:text-4xl">— Petroșani —</span>
            </h1>

            <p className="mt-6 max-w-xl text-2xl leading-9 text-slate-200">
              {siteConfig.tagline}
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-[12rem] bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20">
                <Link to="/live">Urmărește Live</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-[12rem] bg-transparent border-white/40 text-white hover:bg-white/10 hover:border-white/60">
                <Link to="/plan-citire">Plan Biblic</Link>
              </Button>
            </div>

            <div className="mt-28 w-full max-w-2xl">
              <VerseOfTheDay verse={verse} variant="dark" />
            </div>
          </div>
        </Container>

        <div className="absolute inset-x-0 bottom-0 z-10">
          <WaveDivider topColor="transparent" bottomColor="#d4ab84" height={90} />
        </div>
      </section>
      {/* ── Schedule + Events + Calendar ── */}
      <section className="py-20 sm:py-24 bg-[#d4ab84]">
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">

            {/* Card header */}
            <div className="border-b border-slate-100 px-4 py-6 sm:px-10 sm:py-8 text-center">
              <p className="text-base font-semibold uppercase tracking-[0.3em]" style={{ color: '#d4ab84' }}>Vino alături de noi</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">Program & Comunitate</h2>
            </div>

            {/* Program săptămânal — horizontal strip */}
            <div className="border-b border-slate-100 px-4 py-5 sm:px-10 sm:py-7">
              <p className="mb-5 text-center text-base font-bold uppercase tracking-[0.3em] text-slate-700">
                Program săptămânal
              </p>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
                {[...services].sort((a, b) => {
                  const day = (d: number) => d === 0 ? 7 : d;
                  return day(a.dayOfWeek) !== day(b.dayOfWeek)
                    ? day(a.dayOfWeek) - day(b.dayOfWeek)
                    : a.time.localeCompare(b.time);
                }).map(service => {
                  const isNext = nextService?.service.id === service.id && nextService.daysUntil === 0;
                  return (
                    <div
                      key={service.id}
                      className={`rounded-2xl px-5 py-5 sm:px-7 sm:py-5 transition-all duration-200 cursor-default ${
                        isNext
                          ? 'bg-secondary text-secondary-foreground shadow-md shadow-secondary/20 scale-[1.02] hover:scale-[1.05] hover:shadow-lg hover:shadow-secondary/30'
                          : 'border border-slate-100 bg-slate-50 text-slate-700 hover:border-secondary/30 hover:bg-secondary/5 hover:shadow-md hover:scale-[1.02]'
                      }`}
                    >
                      <p className={`text-xs font-bold uppercase tracking-widest ${isNext ? 'text-secondary-foreground/70' : 'text-slate-400'}`}>
                        {service.dayLabel}&nbsp;·&nbsp;{service.time}
                        {service.endTime ? ` – ${service.endTime}` : ''}
                      </p>
                      <p className={`mt-1 text-base font-bold ${isNext ? 'text-secondary-foreground' : 'text-slate-900'}`}>
                        {service.title}
                      </p>
                      {service.isLive && (
                        <p className={`mt-0.5 text-[0.65rem] font-bold uppercase tracking-widest ${isNext ? 'text-secondary-foreground/60' : 'text-secondary'}`}>
                          live
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two columns: Events (left) + Calendar (right) */}
            <div className="grid divide-x divide-slate-100 lg:grid-cols-2">

              {/* LEFT — Events */}
              <div className="p-4 sm:p-10">
                <p className="mb-4 text-center text-base font-bold uppercase tracking-[0.3em] text-slate-700">
                  Evenimente
                </p>
                {upcomingEvents.length > 0 ? (
                  <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {upcomingEvents.map(event => (
                      <EventCard key={event.id} {...event} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-xl bg-slate-50 py-20 text-center">
                    <span className="text-3xl">📅</span>
                    <p className="mt-3 text-sm font-bold text-slate-700">Niciun eveniment planificat</p>
                  </div>
                )}
              </div>

              {/* RIGHT — Calendar */}
              <div className="p-4 sm:p-10">
                <p className="mb-4 text-center text-base font-bold uppercase tracking-[0.3em] text-slate-700">
                  Calendar
                </p>
                <MiniCalendar events={allEvents} holidays={holidays} />
              </div>

            </div>
          </div>
        </Container>
      </section>

      {/* ── Misiunea Noastră ── */}
      <section className="py-20 sm:py-28 bg-[#d4ab84]">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-base font-semibold uppercase tracking-[0.3em] text-slate-700">Cine suntem</p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl text-slate-900">Misiunea Noastră</h2>

            <div className="mt-8 space-y-5 text-lg leading-8 text-slate-800">
              <p>
                Misiunea Bisericii Filadelfia este să-L onoreze pe Dumnezeu prin creșterea unor oameni transformați,
                care trăiesc după modelul lui Cristos în fiecare aspect al vieții. Ne ghidăm după chemarea lui Isus
                din Matei 28:19-20, asumându-ne responsabilitatea de a ajuta oamenii să devină ucenici, să își declare
                credința prin botez și să trăiască în ascultare de învățătura Lui.
              </p>
              <p>
                Ne dorim să construim o comunitate autentică, în care dragostea, maturitatea spirituală și generozitatea
                nu sunt doar valori declarate, ci realități trăite, astfel încât gloria lui Dumnezeu să fie vizibilă
                atât în biserică, cât și în afara ei.
              </p>
            </div>

            <blockquote className="mt-12 rounded-2xl border border-slate-900/15 bg-slate-900/10 px-6 py-8 sm:px-10">
              <p className="text-base leading-8 text-slate-800 italic">
                „Prin urmare, duceți-vă și faceți ucenici din toate neamurile, botezându-i în Numele Tatălui,
                al Fiului și al Duhului Sfânt și învățându-i să păzească tot ce v-am poruncit! Și iată că Eu
                sunt cu voi în toate zilele, până la sfârșitul veacului!"
              </p>
              <footer className="mt-4 text-sm font-bold tracking-wide text-slate-700">Matei 28:19-20</footer>
            </blockquote>
          </div>
        </Container>

      </section>
    </div>
  );
}
