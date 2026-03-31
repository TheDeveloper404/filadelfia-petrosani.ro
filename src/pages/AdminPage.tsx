import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Lock, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import siteConfig from '@/data/site-config.json';
import { dbRead, dbWrite } from '@/lib/db';
import defaultSchedule from '@/data/schedule.json';

const ADMIN_PIN = '1526';
const TICKER_KEY = 'filadelfia_ticker';
const EVENTS_KEY = 'filadelfia_events';
const SCHEDULE_KEY = 'filadelfia_schedule';
const SESSION_KEY = 'filadelfia_admin_unlocked';

interface TickerConfig {
  enabled: boolean;
  text: string;
}

export interface CustomEvent {
  id: string;
  title: string;
  date: string;
  endDate: string | null;
  time: string | null;
  location: string | null;
  description: string;
  registrationUrl: string | null;
  tags: string[];
}

export interface ScheduleService {
  id: string;
  dayLabel: string;
  dayOfWeek: number;
  time: string;
  endTime: string | null;
  title: string;
  isLive: boolean;
}

const DAY_LABELS_ADMIN = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];

const emptyServiceForm = () => ({
  dayOfWeek: '' as number | '',
  time: '',
  endTime: '',
  title: '',
  isLive: false,
});

const emptyForm = () => ({
  title: '',
  date: '',
  endDate: '',
  time: '',
  location: '',
  description: '',
  registrationUrl: '',
});

// ── Date / Time custom selects ──────────────────────────────────────────────

const MONTHS_RO_ADMIN = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const selectCls = 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20';

function DateSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parse = (v: string) => { const [y, m, d] = v ? v.split('-') : ['', '', '']; return [y ?? '', m ?? '', d ?? '']; };
  const [year, setYear] = useState(() => parse(value)[0]);
  const [month, setMonth] = useState(() => parse(value)[1]);
  const [day, setDay] = useState(() => parse(value)[2]);

  useEffect(() => {
    const [y, m, d] = parse(value);
    setYear(y); setMonth(m); setDay(d);
  }, [value]);

  const emit = (y: string, m: string, d: string) => {
    if (y && m && d) onChange(`${y}-${m}-${d}`);
  };

  const currentYear = new Date().getFullYear();
  return (
    <div className="flex gap-2">
      <select value={day} onChange={e => { setDay(e.target.value); emit(year, month, e.target.value); }} className={selectCls}>
        <option value="">Zi</option>
        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
      <select value={month} onChange={e => { setMonth(e.target.value); emit(year, e.target.value, day); }} className={selectCls}>
        <option value="">Luna</option>
        {MONTHS_RO_ADMIN.map((name, i) => {
          const v = String(i + 1).padStart(2, '0');
          return <option key={v} value={v}>{name}</option>;
        })}
      </select>
      <select value={year} onChange={e => { setYear(e.target.value); emit(e.target.value, month, day); }} className={selectCls}>
        <option value="">An</option>
        {Array.from({ length: 6 }, (_, i) => currentYear + i).map(v => (
          <option key={v} value={String(v)}>{v}</option>
        ))}
      </select>
    </div>
  );
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parse = (v: string) => { const [h, m] = v ? v.split(':') : ['', '']; return [h ?? '', m ?? '']; };
  const [hour, setHour] = useState(() => parse(value)[0]);
  const [minute, setMinute] = useState(() => parse(value)[1]);

  useEffect(() => {
    const [h, m] = parse(value);
    setHour(h); setMinute(m);
  }, [value]);

  const emit = (h: string, m: string) => {
    if (h) onChange(`${h}:${m || '00'}`);
    else onChange('');
  };

  return (
    <div className="flex items-center gap-2">
      <select value={hour} onChange={e => { setHour(e.target.value); emit(e.target.value, minute); }} className={selectCls}>
        <option value="">--</option>
        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
      <span className="font-bold text-slate-400">:</span>
      <select value={minute} onChange={e => { setMinute(e.target.value); emit(hour, e.target.value); }} className={selectCls}>
        <option value="">--</option>
        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </div>
  );
}

// ── PIN Screen ─────────────────────────────────────────────────────────────

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const handleDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every(d => d !== '')) {
      const pin = next.join('');
      if (pin === ADMIN_PIN) {
        sessionStorage.setItem(SESSION_KEY, '1');
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setDigits(['', '', '', '']);
          setError(false);
          inputRefs.current[0]?.focus();
        }, 700);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center px-6">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/15">
            <Lock className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Zona Administrator</h1>
        <p className="mb-10 text-slate-400 text-sm">Introdu codul de acces din 4 cifre</p>

        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map(i => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digits[i]}
              autoFocus={i === 0}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`h-16 w-14 rounded-2xl border-2 bg-slate-800 text-center text-2xl font-bold text-white outline-none transition
                ${error
                  ? 'border-red-500 bg-red-950/60'
                  : digits[i]
                    ? 'border-secondary'
                    : 'border-slate-600 focus:border-secondary/60'
                }`}
            />
          ))}
        </div>

        {error && (
          <p className="mt-5 text-sm font-semibold text-red-400">Cod incorect. Încearcă din nou.</p>
        )}
      </div>
    </div>
  );
}

// ── Admin Panel ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const defaultTickerText = (siteConfig as any).ticker?.text ?? '';
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');

  // Ticker
  const [ticker, setTicker] = useState<TickerConfig>({ enabled: true, text: defaultTickerText });
  const [tickerSaved, setTickerSaved] = useState(false);

  // Events
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [eventSaved, setEventSaved] = useState(false);
  const [formError, setFormError] = useState('');

  // Schedule
  const [services, setServices] = useState<ScheduleService[]>(defaultSchedule.services);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm());
  const [serviceSaved, setServiceSaved] = useState(false);
  const [serviceFormError, setServiceFormError] = useState('');

  useEffect(() => {
    if (!unlocked) return;

    dbRead<TickerConfig>('ticker').then(remote => {
      if (remote) {
        setTicker(remote);
        localStorage.setItem(TICKER_KEY, JSON.stringify(remote));
      } else {
        const stored = localStorage.getItem(TICKER_KEY);
        if (stored) { try { setTicker(JSON.parse(stored)); } catch {} }
      }
    });

    dbRead<CustomEvent[]>('events').then(remote => {
      if (remote) {
        setEvents(remote);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(remote));
      } else {
        const stored = localStorage.getItem(EVENTS_KEY);
        if (stored) { try { setEvents(JSON.parse(stored)); } catch {} }
      }
    });

    dbRead<ScheduleService[]>('schedule').then(remote => {
      if (remote && Array.isArray(remote) && remote.length > 0) {
        setServices(remote);
        localStorage.setItem(SCHEDULE_KEY, JSON.stringify(remote));
      } else {
        const stored = localStorage.getItem(SCHEDULE_KEY);
        if (stored) { try { setServices(JSON.parse(stored)); } catch {} }
      }
    });
  }, [unlocked]);

  // ── Ticker handlers ────────────────────────────────────────────────────

  const handleTickerSave = () => {
    localStorage.setItem(TICKER_KEY, JSON.stringify(ticker));
    dbWrite('ticker', ticker);
    setTickerSaved(true);
    setTimeout(() => setTickerSaved(false), 2000);
  };

  const handleTickerReset = () => {
    const def = { enabled: true, text: defaultTickerText };
    localStorage.removeItem(TICKER_KEY);
    dbWrite('ticker', def);
    setTicker(def);
  };

  // ── Events handlers ────────────────────────────────────────────────────

  const persistEvents = (list: CustomEvent[]) => {
    setEvents(list);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
    dbWrite('events', list);
  };

  const handleEditEvent = (ev: CustomEvent) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      date: ev.date,
      endDate: ev.endDate ?? '',
      time: ev.time ?? '',
      location: ev.location ?? '',
      description: ev.description,
      registrationUrl: ev.registrationUrl ?? '',
    });
    setShowForm(true);
    setFormError('');
  };

  const handleSaveEvent = () => {
    if (!form.title.trim()) { setFormError('Titlul este obligatoriu.'); return; }
    if (!form.date) { setFormError('Data de început este obligatorie.'); return; }
    if (!form.description.trim()) { setFormError('Descrierea este obligatorie.'); return; }

    if (editingId) {
      persistEvents(events.map(ev => ev.id === editingId ? {
        ...ev,
        title: form.title.trim(),
        date: form.date,
        endDate: form.endDate || null,
        time: form.time || null,
        location: form.location.trim() || null,
        description: form.description.trim(),
        registrationUrl: form.registrationUrl.trim() || null,
      } : ev));
    } else {
      const newEvent: CustomEvent = {
        id: `custom-${Date.now()}`,
        title: form.title.trim(),
        date: form.date,
        endDate: form.endDate || null,
        time: form.time || null,
        location: form.location.trim() || null,
        description: form.description.trim(),
        registrationUrl: form.registrationUrl.trim() || null,
        tags: ['eveniment'],
      };
      persistEvents([...events, newEvent]);
    }

    setForm(emptyForm());
    setShowForm(false);
    setEditingId(null);
    setFormError('');
    setEventSaved(true);
    setTimeout(() => setEventSaved(false), 2500);
  };

  const handleDeleteEvent = (id: string) => {
    persistEvents(events.filter(e => e.id !== id));
  };

  const handleLock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
  };

  // ── Schedule handlers ──────────────────────────────────────────────────

  const persistSchedule = (list: ScheduleService[]) => {
    const sorted = [...list].sort((a, b) =>
      a.dayOfWeek !== b.dayOfWeek ? a.dayOfWeek - b.dayOfWeek : a.time.localeCompare(b.time),
    );
    setServices(sorted);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(sorted));
    dbWrite('schedule', sorted);
  };

  const handleEditService = (svc: ScheduleService) => {
    setEditingServiceId(svc.id);
    setServiceForm({ dayOfWeek: svc.dayOfWeek, time: svc.time, endTime: svc.endTime ?? '', title: svc.title, isLive: svc.isLive });
    setShowServiceForm(true);
    setServiceFormError('');
  };

  const handleSaveService = () => {
    if (serviceForm.dayOfWeek === '') { setServiceFormError('Ziua este obligatorie.'); return; }
    if (!serviceForm.time) { setServiceFormError('Ora de început este obligatorie.'); return; }
    if (!serviceForm.title.trim()) { setServiceFormError('Titlul este obligatoriu.'); return; }

    const day = serviceForm.dayOfWeek as number;
    if (editingServiceId) {
      persistSchedule(services.map(s => s.id === editingServiceId ? {
        ...s, dayOfWeek: day, dayLabel: DAY_LABELS_ADMIN[day],
        time: serviceForm.time, endTime: serviceForm.endTime || null,
        title: serviceForm.title.trim(), isLive: serviceForm.isLive,
      } : s));
    } else {
      persistSchedule([...services, {
        id: `svc-${Date.now()}`,
        dayOfWeek: day, dayLabel: DAY_LABELS_ADMIN[day],
        time: serviceForm.time, endTime: serviceForm.endTime || null,
        title: serviceForm.title.trim(), isLive: serviceForm.isLive,
        tags: [],
      } as ScheduleService]);
    }

    setServiceForm(emptyServiceForm());
    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceFormError('');
    setServiceSaved(true);
    setTimeout(() => setServiceSaved(false), 2500);
  };

  const handleDeleteService = (id: string) => {
    persistSchedule(services.filter(s => s.id !== id));
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (!unlocked) {
    return <PinScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-slate-900 px-6 py-5">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Panou Administrator</p>
            <h1 className="mt-0.5 text-lg font-bold text-white">Filadelfia — Administrare</h1>
          </div>
          <button
            onClick={handleLock}
            className="flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <Lock className="h-3.5 w-3.5" />
            Blochează
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">

        {/* ── Events card ── */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Evenimente</h2>
              <p className="mt-1 text-sm text-slate-500">
                Evenimentele adăugate apar pe pagina principală, alături de cele din calendar.
              </p>
            </div>
            <button
              onClick={() => { setShowForm(s => !s); setFormError(''); setForm(emptyForm()); setEditingId(null); }}
              className="flex shrink-0 items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
            >
              <Plus className="h-4 w-4" />
              Adaugă
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="border-b border-slate-100 bg-amber-50/40 px-8 py-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{editingId ? 'Editează eveniment' : 'Eveniment nou'}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Titlu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="ex: Conferință de tineret"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Data de început <span className="text-red-500">*</span>
                  </label>
                  <DateSelect value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Data de sfârșit</label>
                  <DateSelect value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Ora</label>
                  <TimeSelect value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Locație</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="ex: Sala principală"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Descriere <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Descrie evenimentul pe scurt..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Link înregistrare / detalii</label>
                  <input
                    type="url"
                    value={form.registrationUrl}
                    onChange={e => setForm(f => ({ ...f, registrationUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm font-semibold text-red-500">{formError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSaveEvent}
                  className="rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
                >
                  {editingId ? 'Actualizează' : 'Salvează evenimentul'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setForm(emptyForm()); setFormError(''); setEditingId(null); }}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Anulează
                </button>
              </div>
            </div>
          )}

          {/* Events list */}
          <div className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <div className="px-8 py-12 text-center">
                <p className="text-sm text-slate-400">
                  Niciun eveniment adăugat încă.
                </p>
              </div>
            ) : (
              events.map(ev => (
                <div key={ev.id} className="flex items-start justify-between gap-4 px-8 py-5">
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">
                      {ev.date}{ev.endDate ? ` – ${ev.endDate}` : ''}
                      {ev.time ? ` · ${ev.time}` : ''}
                    </p>
                    <p className="mt-0.5 font-semibold text-slate-900">{ev.title}</p>
                    {ev.location && (
                      <p className="text-xs text-slate-400">{ev.location}</p>
                    )}
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{ev.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => handleEditEvent(ev)}
                      aria-label="Editează eveniment"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-secondary/10 hover:text-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      aria-label="Șterge eveniment"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {eventSaved && (
            <div className="border-t border-green-100 bg-green-50 px-8 py-3 text-sm font-semibold text-green-700">
              ✓ Eveniment salvat cu succes
            </div>
          )}
        </Card>

        {/* ── Schedule card ── */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Program săptămânal</h2>
              <p className="mt-1 text-sm text-slate-500">Servicii recurente afișate pe pagina principală.</p>
            </div>
            <button
              onClick={() => { setShowServiceForm(s => !s); setServiceForm(emptyServiceForm()); setEditingServiceId(null); setServiceFormError(''); }}
              className="flex shrink-0 items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
            >
              <Plus className="h-4 w-4" />
              Adaugă
            </button>
          </div>

          {showServiceForm && (
            <div className="border-b border-slate-100 bg-amber-50/40 px-8 py-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{editingServiceId ? 'Editează serviciu' : 'Serviciu nou'}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Zi <span className="text-red-500">*</span></label>
                  <select
                    value={serviceForm.dayOfWeek}
                    onChange={e => setServiceForm(f => ({ ...f, dayOfWeek: e.target.value === '' ? '' : Number(e.target.value) }))}
                    className={selectCls + ' w-full'}
                  >
                    <option value="">Selectează ziua</option>
                    {DAY_LABELS_ADMIN.map((label, i) => (
                      <option key={i} value={i}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Titlu <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={e => setServiceForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="ex: Serviciu divin"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Ora început <span className="text-red-500">*</span></label>
                  <TimeSelect value={serviceForm.time} onChange={v => setServiceForm(f => ({ ...f, time: v }))} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Ora sfârșit</label>
                  <TimeSelect value={serviceForm.endTime} onChange={v => setServiceForm(f => ({ ...f, endTime: v }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={serviceForm.isLive} onChange={e => setServiceForm(f => ({ ...f, isLive: e.target.checked }))} />
                      <div className={`h-6 w-11 rounded-full transition-colors ${serviceForm.isLive ? 'bg-secondary' : 'bg-slate-300'}`} />
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${serviceForm.isLive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Transmis live pe YouTube</span>
                  </label>
                </div>
              </div>
              {serviceFormError && <p className="text-sm font-semibold text-red-500">{serviceFormError}</p>}
              <div className="flex gap-3">
                <button onClick={handleSaveService} className="rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90">
                  {editingServiceId ? 'Actualizează' : 'Salvează'}
                </button>
                <button onClick={() => { setShowServiceForm(false); setServiceForm(emptyServiceForm()); setServiceFormError(''); setEditingServiceId(null); }} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                  Anulează
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {services.map(svc => (
              <div key={svc.id} className="flex items-center justify-between gap-4 px-8 py-4">
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">
                    {svc.dayLabel}&nbsp;·&nbsp;{svc.time}{svc.endTime ? ` – ${svc.endTime}` : ''}
                    {svc.isLive && <span className="ml-2 text-slate-400">· live</span>}
                  </p>
                  <p className="mt-0.5 font-semibold text-slate-900">{svc.title}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => handleEditService(svc)} className="rounded-lg p-2 text-slate-400 transition hover:bg-secondary/10 hover:text-secondary">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteService(svc.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {serviceSaved && (
            <div className="border-t border-green-100 bg-green-50 px-8 py-3 text-sm font-semibold text-green-700">
              ✓ Program actualizat cu succes
            </div>
          )}
        </Card>

        {/* ── Ticker card ── */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
            <h2 className="text-xl font-bold text-slate-900">Bandă de știri (ticker)</h2>
            <p className="mt-1 text-sm text-slate-500">
              Textul afișat în banda derulantă de sub header.
            </p>
          </div>
          <div className="space-y-5 p-8">
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={ticker.enabled}
                  onChange={e => setTicker(t => ({ ...t, enabled: e.target.checked }))}
                />
                <div className={`h-6 w-11 rounded-full transition-colors ${ticker.enabled ? 'bg-secondary' : 'bg-slate-300'}`} />
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ticker.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {ticker.enabled ? 'Activat' : 'Dezactivat'}
              </span>
            </label>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Text ticker</label>
              <textarea
                rows={3}
                value={ticker.text}
                onChange={e => setTicker(t => ({ ...t, text: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="Textul care va rula în bandă..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTickerSave}
                className="rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
              >
                {tickerSaved ? 'Salvat ✓' : 'Salvează'}
              </button>
              <button
                onClick={handleTickerReset}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Resetează la default
              </button>
            </div>
          </div>
        </Card>


      </div>
    </div>
  );
}
