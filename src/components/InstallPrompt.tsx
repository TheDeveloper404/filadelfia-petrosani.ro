import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'filadelfia_install_dismissed';

function getOS(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'other';
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null);
  const os = getOS();

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Capture Android Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => void });
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show modal after 30 seconds
    const timer = setTimeout(() => setShow(true), 30_000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    }
    dismiss();
  };

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img src="/icon-192.png" alt="Filadelfia" className="h-12 w-12 rounded-xl" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Instalează aplicația</h3>
            <p className="text-xs text-slate-500">Biserica Filadelfia Petroșani</p>
          </div>
          <button onClick={dismiss} className="ml-auto rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-5">
          Adaugă site-ul pe ecranul principal pentru acces rapid la live, program și știri.
        </p>

        {/* iOS steps */}
        {os === 'ios' && (
          <ol className="space-y-2 mb-5">
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">1</span>
              Apasă butonul <strong className="mx-1">Share</strong>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
              </svg>
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">2</span>
              Selectează <strong className="ml-1">„Add to Home Screen"</strong>
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">3</span>
              Apasă <strong className="ml-1">„Add"</strong>
            </li>
          </ol>
        )}

        {/* Android with deferred prompt */}
        {os === 'android' && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full rounded-full bg-secondary py-3 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90 mb-3"
          >
            Instalează acum
          </button>
        )}

        {/* Android without deferred prompt */}
        {os === 'android' && !deferredPrompt && (
          <ol className="space-y-2 mb-5">
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">1</span>
              Apasă <strong className="ml-1">⋮</strong> (meniu browser)
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">2</span>
              Selectează <strong className="ml-1">„Add to Home Screen"</strong>
            </li>
          </ol>
        )}

        <button onClick={dismiss} className="w-full rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
          Nu, mulțumesc
        </button>
      </div>
    </div>,
    document.body
  );
}
