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
        } else {
          setLiveState('offline');
        }
      })
      .catch(() => { if (!cancelled) setLiveState('offline'); })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    onStateChange?.(liveState === 'live');
  }, [liveState]);

  const liveSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`
    : null;

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950">

      {liveState === 'checking' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
        </div>
      )}

      {liveState === 'live' && liveSrc && (
        <iframe
          key="live"
          className="h-full w-full"
          src={liveSrc}
          title="Transmisie live"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}

      {liveState === 'offline' && (
        <iframe
          key="offline"
          className="h-full w-full"
          src={latestSrc}
          title="Ultimul program"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
