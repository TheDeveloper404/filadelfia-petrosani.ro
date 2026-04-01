import { useState, useEffect, useRef } from 'react';
import { dbRead } from '@/lib/db';

const STORAGE_KEY = 'filadelfia_ticker';

interface TickerConfig {
  enabled: boolean;
  text: string;
}

export default function NewsTicker() {
  const [config, setConfig] = useState<TickerConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { enabled: false, text: '' };
  });

  const spanRef = useRef<HTMLSpanElement>(null);
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    dbRead<TickerConfig>('ticker').then(remote => {
      if (remote !== undefined) {
        const val = remote ?? { enabled: false, text: '' };
        setConfig(val);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
      }
    });
  }, []);

  // Calculate duration based on actual text width so speed is always consistent (~80px/s)
  useEffect(() => {
    if (!spanRef.current) return;
    const w = spanRef.current.offsetWidth;
    if (w > 0) setDuration(Math.round(w / 80));
  }, [config.text]);

  if (!config.enabled || !config.text.trim()) return null;

  return (
    <div className="overflow-hidden bg-white/10 backdrop-blur-md border-y border-white/15 py-3 text-white relative z-10">
      <div
        className="ticker-track flex whitespace-nowrap"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            ref={i === 0 ? spanRef : undefined}
            className="inline-block px-6 sm:px-16 text-base font-semibold tracking-wide"
            aria-hidden={i > 0 ? true : undefined}
          >
            {config.text}
          </span>
        ))}
      </div>
    </div>
  );
}
