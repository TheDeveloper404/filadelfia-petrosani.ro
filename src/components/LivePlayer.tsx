import { useEffect, useState } from 'react';
import siteConfig from '@/data/site-config.json';

type LiveState = 'checking' | 'live' | 'offline';

interface LiveStatus {
  isLive: boolean;
  videoId: string | null;
  title: string | null;
}

const uploadsPlaylist = siteConfig.youtube.channelId.replace(/^UC/, 'UU');
const latestSrc = `https://www.youtube.com/embed?listType=playlist&list=${uploadsPlaylist}&rel=0&modestbranding=1`;

export default function LivePlayer({ onStateChange }: { onStateChange?: (live: boolean) => void }) {
  const [liveState, setLiveState] = useState<LiveState>('checking');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [playing, setPlayingState] = useState(() => sessionStorage.getItem('livePlayer_playing') === '1');

  const setPlaying = (v: boolean) => {
    sessionStorage.setItem('livePlayer_playing', v ? '1' : '0');
    setPlayingState(v);
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch('/api/live-status', { signal: controller.signal })
      .then(r => r.json() as Promise<LiveStatus>)
      .then(data => {
        if (cancelled) return;
        if (data.isLive && data.videoId) {
          setVideoId(data.videoId);
          setLiveState('live');
          setPlaying(true);
          fetch('/api/notify-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: data.videoId, title: data.title }),
          }).catch(() => {});
        } else {
          setLiveState('offline');
        }
      })
      .catch(() => { if (!cancelled) setLiveState('offline'); })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      sessionStorage.removeItem('livePlayer_playing');
    };
  }, []);

  useEffect(() => {
    onStateChange?.(liveState === 'live');
  }, [liveState]);

  const liveSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950">

      {/* Iframe — always rendered so it's ready */}
      {(liveState === 'offline' || (liveState === 'live' && playing)) && (
        <iframe
          key="player"
          className="h-full w-full"
          src={liveState === 'live' && liveSrc ? liveSrc : latestSrc}
          title={liveState === 'live' ? 'Transmisie live' : 'Ultimul program'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}

      {/* Checking spinner */}
      {liveState === 'checking' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
        </div>
      )}

      {/* Live overlay — user click → autoplay cu sunet garantat */}
      {liveState === 'live' && !playing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 gap-5">
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Transmisie în direct
          </span>
          <button
            onClick={() => setPlaying(true)}
            className="flex items-center gap-3 rounded-full bg-secondary px-8 py-4 text-base font-bold text-secondary-foreground shadow-lg shadow-secondary/30 transition hover:bg-secondary/90 hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
            Urmărește Live
          </button>
        </div>
      )}
    </div>
  );
}
