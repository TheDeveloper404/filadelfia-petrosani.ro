import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Lock, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import siteConfig from '@/data/site-config.json';
import { dbRead, dbWrite } from '@/lib/db';
import PageMeta from '@/components/PageMeta';
import defaultSchedule from '@/data/schedule.json';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? '';
const EVENTS_KEY = 'filadelfia_events';
const SCHEDULE_KEY = 'filadelfia_schedule';
const SESSION_KEY = 'filadelfia_admin_unlocked';

export interface CustomEvent {
  id: string;
  title: string;
  date: string;
  endDate: string | null;
  time: string | null;
  location: string | null;
  description: string;
  tags: string[];
  isLive?: boolean;
}

export interface ScheduleService {
  id: string;
  dayLabel: string;
  dayOfWeek: number;
  time: string;
  endTime: string | null;
  title: string;
  isLive: boolean;
  liveOverride?: boolean;
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
  isLive: false,
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
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');

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


  // Maintenance banner
  const [banner, setBanner] = useState({ active: false, message: '' });
  const [bannerSaved, setBannerSaved] = useState(false);

  // Stats
  const [stats, setStats] = useState<Record<string, number>>({});

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'event' | 'service'; id: string; label: string } | null>(null);

  // Undo delete
  const [lastDeleted, setLastDeleted] = useState<{ type: 'event' | 'service'; item: CustomEvent | ScheduleService; label: string } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!unlocked) return;

    dbRead<{ active: boolean; message: string }>('maintenanceBanner').then(remote => {
      if (remote && typeof remote === 'object') setBanner(remote);
    });

    dbRead<Record<string, number>>('stats').then(remote => {
      if (remote && typeof remote === 'object') setStats(remote);
    });

    dbRead<CustomEvent[]>('events').then(remote => {
      if (remote !== undefined) {
        const list = Array.isArray(remote) ? remote : [];
        setEvents(list);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
      } else {
        const stored = localStorage.getItem(EVENTS_KEY);
        if (stored) { try { setEvents(JSON.parse(stored)); } catch {} }
      }
    });

    dbRead<ScheduleService[]>('schedule').then(remote => {
      if (remote !== undefined && Array.isArray(remote) && remote.length > 0) {
        setServices(remote);
        localStorage.setItem(SCHEDULE_KEY, JSON.stringify(remote));
      } else {
        const stored = localStorage.getItem(SCHEDULE_KEY);
        if (stored) { try { setServices(JSON.parse(stored)); } catch {} }
      }
    });
  }, [unlocked]);

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
      isLive: ev.isLive ?? false,
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
        isLive: form.isLive,
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
        tags: ['eveniment'],
        isLive: form.isLive,
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
    const ev = events.find(e => e.id === id);
    setConfirmDelete({ type: 'event', id, label: ev?.title ?? 'eveniment' });
  };

  const handleSaveBanner = () => {
    dbWrite('maintenanceBanner', banner);
    setBannerSaved(true);
    setTimeout(() => setBannerSaved(false), 2500);
  };

  const handleToggleLiveOverride = (id: string) => {
    const updated = services.map(s => s.id === id ? { ...s, liveOverride: !s.liveOverride } : s);
    persistSchedule(updated);
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
    const svc = services.find(s => s.id === id);
    setConfirmDelete({ type: 'service', id, label: svc?.title ?? 'serviciu' });
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'event') {
      const item = events.find(e => e.id === confirmDelete.id);
      if (item) {
        persistEvents(events.filter(e => e.id !== confirmDelete.id));
        scheduleUndo({ type: 'event', item, label: confirmDelete.label });
      }
    } else {
      const item = services.find(s => s.id === confirmDelete.id);
      if (item) {
        persistSchedule(services.filter(s => s.id !== confirmDelete.id));
        scheduleUndo({ type: 'service', item, label: confirmDelete.label });
      }
    }
    setConfirmDelete(null);
  };

  const scheduleUndo = (deleted: { type: 'event' | 'service'; item: CustomEvent | ScheduleService; label: string }) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setLastDeleted(deleted);
    undoTimerRef.current = setTimeout(() => setLastDeleted(null), 5000);
  };

  const handleUndo = () => {
    if (!lastDeleted) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (lastDeleted.type === 'event') {
      persistEvents([...events, lastDeleted.item as CustomEvent]);
    } else {
      persistSchedule([...services, lastDeleted.item as ScheduleService]);
    }
    setLastDeleted(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (!unlocked) {
    return <PinScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageMeta title="Admin" />
      {/* Top bar */}
      <div className="bg-slate-900 px-6 py-5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
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

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-10 items-start">

        {/* ── Maintenance banner card ── */}
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mesaj de indisponibilitate</h2>
              <p className="mt-1 text-sm text-slate-500">Banner afișat pe toate paginile — mentenanță, live căzut, anunț urgent.</p>
            </div>
            <label className="flex cursor-pointer items-center gap-3 shrink-0">
              <span className={`text-sm font-bold ${banner.active ? 'text-amber-600' : 'text-slate-400'}`}>
                {banner.active ? 'Activ' : 'Inactiv'}
              </span>
              <div className="relative" onClick={() => setBanner(b => ({ ...b, active: !b.active }))}>
                <div className={`h-7 w-14 rounded-full transition-colors ${banner.active ? 'bg-amber-500' : 'bg-slate-300'}`} />
                <div className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${banner.active ? 'translate-x-8' : 'translate-x-1'}`} />
              </div>
            </label>
          </div>
          <div className="px-8 py-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mesaj</label>
              <input
                type="text"
                value={banner.message}
                onChange={e => setBanner(b => ({ ...b, message: e.target.value }))}
                placeholder="ex: Livestream-ul nu este disponibil momentan. Revenim în curând."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveBanner}
                className="rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
              >
                Salvează
              </button>
              {bannerSaved && <span className="text-sm font-semibold text-green-600">✓ Salvat</span>}
            </div>
          </div>
        </Card>

        {/* ── Stats card ── */}
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const todayCount = stats[today] ?? 0;
          const weekCount = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return stats[d.toISOString().slice(0, 10)] ?? 0;
          }).reduce((a, b) => a + b, 0);
          return (
            <Card className="overflow-hidden p-0 lg:col-span-2">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
                <h2 className="text-xl font-bold text-slate-900">Statistici vizitatori</h2>
                <p className="mt-1 text-sm text-slate-500">Sesiuni unice — o sesiune per tab de browser.</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100 px-0">
                <div className="px-8 py-6 text-center">
                  <p className="text-4xl font-bold text-slate-900">{todayCount}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Azi</p>
                </div>
                <div className="px-8 py-6 text-center">
                  <p className="text-4xl font-bold text-slate-900">{weekCount}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Ultimele 7 zile</p>
                </div>
              </div>
            </Card>
          );
        })()}

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
                  <label className="flex cursor-pointer items-center gap-3">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={form.isLive} onChange={e => setForm(f => ({ ...f, isLive: e.target.checked }))} />
                      <div className={`h-6 w-11 rounded-full transition-colors ${form.isLive ? 'bg-secondary' : 'bg-slate-300'}`} />
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.isLive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Transmis live pe YouTube</span>
                  </label>
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
                <div className="flex shrink-0 items-center gap-3">
                  {svc.isLive && (
                    <button
                      onClick={() => handleToggleLiveOverride(svc.id)}
                      title={svc.liveOverride ? 'Dezactivează live forțat' : 'Forțează live acum'}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                        svc.liveOverride
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500'
                      }`}
                    >
                      {svc.liveOverride && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white shrink-0" />}
                      {svc.liveOverride ? 'LIVE' : 'Forțează live'}
                    </button>
                  )}
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

      </div>

      {/* ── Undo banner ── */}
      {lastDeleted && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-4 rounded-2xl bg-slate-900 px-6 py-4 shadow-xl">
          <p className="text-sm text-white">
            <span className="font-semibold">"{lastDeleted.label}"</span> a fost șters.
          </p>
          <button
            onClick={handleUndo}
            className="rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/90"
          >
            Anulează
          </button>
        </div>
      )}

      {/* ── Confirm delete modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Confirmare ștergere</h3>
            <p className="mt-2 text-sm text-slate-600">
              Ești sigur că vrei să ștergi{' '}
              <span className="font-semibold">"{confirmDelete.label}"</span>?
              Acțiunea nu poate fi anulată.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Anulează
              </button>
              <button
                onClick={confirmDeleteAction}
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-600"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
