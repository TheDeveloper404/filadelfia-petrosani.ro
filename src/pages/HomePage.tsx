import { useState, useEffect, startTransition } from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '@/data/site-config.json';
import staticEvents from '@/data/events.json';
import holidays from '@/data/holidays.json';
import schedule from '@/data/schedule.json';
import versesData from '@/data/verses.json';
import { getVerseOfTheDay } from '@/utils/verse';
import { isUpcoming, isTodayEvent } from '@/utils/date';
import { getNextService, getServiceNextDate } from '@/utils/schedule';
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
        localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
        startTransition(() => setCustomEvents(list));
      }
    });
    dbRead<typeof schedule.services>('schedule').then(remote => {
      if (remote !== undefined && Array.isArray(remote) && remote.length > 0) {
        localStorage.setItem(SCHEDULE_KEY, JSON.stringify(remote));
        startTransition(() => setServices(remote));
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
      <PageMeta title="Biserica Penticostală Filadelfia | Petroșani" description={siteConfig.description} />

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

            <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-200">
              Indiferent dacă aveți o relație cu Isus de mult timp sau sunteți la început în descoperirea credinței, la Biserica Penticostală Filadelfia din Petroșani vă este alături pentru a vă sprijini în apropierea de Dumnezeu și în înțelegerea mântuirii oferite prin har.
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
          <WaveDivider bottomColor="#d4ab84" height={90} />
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

            {/* Program săptămânal — list */}
            <div className="border-b border-slate-100">
              <p className="px-4 pt-6 pb-4 text-center text-base font-bold uppercase tracking-[0.3em] text-slate-700 sm:px-10">
                Program săptămânal
              </p>
              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-8">
                {[...services].sort((a, b) => {
                  const day = (d: number) => d === 0 ? 7 : d;
                  return day(a.dayOfWeek) !== day(b.dayOfWeek)
                    ? day(a.dayOfWeek) - day(b.dayOfWeek)
                    : a.time.localeCompare(b.time);
                }).map(service => {
                  const isNext = nextService?.service.id === service.id && nextService.daysUntil === 0;
                  const now = new Date();
                  const nextDate = getServiceNextDate(service, now);
                  const dateLabel = `${String(nextDate.getDate()).padStart(2, '0')}.${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
                  return (
                    <div
                      key={service.id}
                      className={`relative overflow-hidden rounded-2xl border px-5 py-4 transition-all ${
                        isNext
                          ? 'border-secondary/40 bg-secondary/8 shadow-sm shadow-secondary/10'
                          : 'border-slate-100 bg-slate-50 hover:border-secondary/20 hover:bg-secondary/4'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-secondary">{service.dayLabel} · {dateLabel}</p>
                          <p className="mt-1.5 text-lg font-bold text-slate-900">{service.title}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-slate-500 sm:rounded-lg sm:bg-white sm:px-3 sm:py-2 sm:text-base sm:text-slate-700 sm:shadow-sm sm:border sm:border-slate-100">
                            {service.time}{service.endTime ? ` – ${service.endTime}` : ''}
                          </p>
                        </div>
                      </div>
                      {isNext && (
                        <p className="mt-2 text-xs font-semibold text-secondary/70">Urmează</p>
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
                  <div className="max-h-[420px] overflow-y-auto space-y-3 px-1 py-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {upcomingEvents.map(event => (
                      <EventCard key={event.id} {...event} isToday={isTodayEvent(event.date, event.endDate)} />
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

      {/* ── Misiune, Viziune și Valori ── */}
      <section className="py-20 sm:py-28 bg-[#d4ab84]">
        <Container>

          {/* Section label */}
          <div className="mb-12 text-center">
            <p className="text-base font-semibold uppercase tracking-[0.3em] text-slate-700">Cine suntem?</p>
          </div>

          {/* Two columns */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">

            {/* LEFT — title + image */}
            <div className="flex flex-col items-center gap-14">
              <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl text-center">Misiune, Viziune și Valori</h2>
              <img
                src="/filadelfia.jpg"
                alt="Biserica Penticostală Filadelfia Petroșani"
                className="w-full rounded-3xl object-cover shadow-xl shadow-slate-900/20"
                style={{ maxHeight: '400px' }}
              />
              <Link
                to="/despre-noi"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Află mai multe despre noi
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* RIGHT — three sections */}
            <div className="flex flex-col divide-y divide-slate-900/15">

              {/* Misiune */}
              <div className="pb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-7 w-1 rounded-full bg-slate-900/40" />
                  <h3 className="text-lg font-bold text-slate-900">Misiune</h3>
                </div>
                <p className="text-base leading-7 text-slate-800">
                  Misiunea Bisericii Filadelfia este să-L onoreze pe Dumnezeu prin creșterea unor oameni
                  transformați, care trăiesc după modelul lui Cristos în fiecare aspect al vieții. Ne ghidăm
                  după chemarea lui Isus din Matei 28:19-20 — să facem ucenici, să-i botezăm și să-i învățăm
                  să trăiască în ascultare de Cuvântul Lui.
                </p>
              </div>

              {/* Viziune */}
              <div className="py-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-7 w-1 rounded-full bg-slate-900/40" />
                  <h3 className="text-lg font-bold text-slate-900">Viziune</h3>
                </div>
                <p className="text-base leading-7 text-slate-800">
                  Să fim o biserică vie și relevantă, un loc în care fiecare om — indiferent de unde vine —
                  poate întâlni pe Dumnezeu, poate crește în credință și poate contribui la transformarea
                  comunității din Petroșani și a lumii din jur.
                </p>
              </div>

              {/* Valori */}
              <div className="pt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-7 w-1 rounded-full bg-slate-900/40" />
                  <h3 className="text-lg font-bold text-slate-900">Valori</h3>
                </div>
                <ul className="space-y-2 text-base leading-7 text-slate-800">
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900/30" /><span><strong className="text-slate-900">Credință</strong> — ancorată în Biblie și trăită zilnic</span></li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900/30" /><span><strong className="text-slate-900">Comunitate</strong> — autentică, primitoare și plină de dragoste</span></li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900/30" /><span><strong className="text-slate-900">Slujire</strong> — cu bucurie, în Duh și în Adevăr</span></li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900/30" /><span><strong className="text-slate-900">Generozitate</strong> — față de aproapele nostru și față de lume</span></li>
                </ul>
              </div>

            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
