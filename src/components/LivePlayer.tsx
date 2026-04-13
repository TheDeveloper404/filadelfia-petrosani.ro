import { useEffect, useRef, useState } from 'react';
import siteConfig from '@/data/site-config.json';

type LiveState = 'checking' | 'live' | 'offline';

export default function LivePlayer() {
  const channelId = siteConfig.youtube.channelId;
  const uploadsPlaylist = channelId.replace(/^UC/, 'UU');
  const liveEmbedSrc = `https://www.youtube.com/embed/live_stream?channel=${channelId}&enablejsapi=1&rel=0&modestbranding=1`;
  const latestSrc = `https://www.youtube.com/embed?listType=playlist&list=${uploadsPlaylist}&rel=0&modestbranding=1`;

  const [liveState, setLiveState] = useState<LiveState>('checking');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let offlineTimer: ReturnType<typeof setTimeout> | null = null;

    const clearOfflineTimer = () => {
      if (offlineTimer) { clearTimeout(offlineTimer); offlineTimer = null; }
    };

    const handleMessage = (event: MessageEvent) => {
      if (!String(event.origin).includes('youtube.com')) return;
      try {
        const data = JSON.parse(event.data as string);
        if (data.event === 'infoDelivery' && data.info) {
          const isLive = data.info.videoData?.isLive;
          if (isLive === true) {
            clearOfflineTimer();
            setLiveState('live');
          } else if (isLive === false) {
            setLiveState(prev => {
              if (prev !== 'live') return 'offline';
              // Confirmed live before — wait 30s of consistent offline signal
              if (!offlineTimer) {
                offlineTimer = setTimeout(() => {
                  setLiveState('offline');
                  offlineTimer = null;
                }, 30_000);
              }
              return prev;
            });
          }
        }
        if (data.event === 'onError') {
          setLiveState(prev => prev === 'live' ? prev : 'offline');
        }
      } catch { /* ignore non-JSON messages */ }
    };

    window.addEventListener('message', handleMessage);

    // Give YouTube 15s to respond before assuming offline
    const fallback = setTimeout(() => {
      setLiveState(prev => prev === 'checking' ? 'offline' : prev);
    }, 15_000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(fallback);
      clearOfflineTimer();
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className={`flex items-center gap-3 rounded-2xl border px-5 py-4 transition-colors ${
        liveState === 'live' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
      }`}>
        {liveState === 'checking' && (
          <>
            <div className="h-2.5 w-2.5 shrink-0 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
            <p className="text-sm font-semibold text-slate-500">Se verifică transmisia...</p>
          </>
        )}
        {liveState === 'live' && (
          <>
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 shrink-0" />
            <p className="text-sm font-semibold text-red-600">Transmisie în direct</p>
          </>
        )}
        {liveState === 'offline' && (
          <>
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300 shrink-0" />
            <p className="text-sm font-semibold text-slate-600">Nu se transmite live în acest moment</p>
          </>
        )}
      </div>

      <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950">
        <iframe
          ref={iframeRef}
          key={liveState === 'offline' ? 'offline' : 'live'}
          className="h-full w-full"
          src={liveState === 'offline' ? latestSrc : liveEmbedSrc}
          title={liveState === 'live' ? 'Transmisie live' : 'Ultimul program'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
        {liveState === 'checking' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
