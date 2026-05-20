import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
const DISMISSED_KEY = 'filadelfia_push_dismissed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const timer = setTimeout(() => setShow(true), 10_000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setShow(false);
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC) {
        dismiss();
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { dismiss(); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC).buffer as ArrayBuffer,
      });
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch {
      // user denied or SW not ready — silently dismiss
    } finally {
      dismiss();
    }
  };

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Notificări live</h3>
            <p className="text-xs text-slate-500">Biserica Filadelfia Petroșani</p>
          </div>
          <button onClick={dismiss} className="ml-auto rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-5">
          Vrei să primești o notificare când începe transmisia în direct? Nu trimitem spam — doar când suntem live.
        </p>

        <button
          onClick={subscribe}
          disabled={loading}
          className="w-full rounded-full bg-secondary py-3 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90 mb-3 disabled:opacity-60"
        >
          {loading ? 'Se activează...' : 'Da, anunță-mă când e live'}
        </button>

        <button onClick={dismiss} className="w-full rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
          Nu, mulțumesc
        </button>
      </div>
    </div>,
    document.body
  );
}
