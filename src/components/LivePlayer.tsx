import siteConfig from '@/data/site-config.json';

interface LivePlayerProps {
  videoId?: string;
  autoplay?: boolean;
}

function isServiceLive(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  const windows = [
    siteConfig.serviceWindows.sundayMorning,
    siteConfig.serviceWindows.sundayEvening,
    siteConfig.serviceWindows.thursday,
  ];

  return windows.some(w => day === w.dayOfWeek && hour >= w.startHour && hour < w.endHour);
}

export default function LivePlayer({ autoplay = false }: LivePlayerProps) {
  const probablyLive = isServiceLive();
  const channelId = siteConfig.youtube.channelId;
  const liveEmbedSrc = `https://www.youtube.com/embed/live_stream?channel=${channelId}&rel=0&modestbranding=1${autoplay ? '&autoplay=1&mute=1' : ''}`;

  if (probablyLive) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-lg">
        <p className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Transmisie în direct
        </p>
        <div className="aspect-video overflow-hidden rounded-3xl bg-slate-950">
          <iframe
            className="h-full w-full"
            src={liveEmbedSrc}
            title="Transmisie live"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Uploads playlist: replace UC → UU in channelId
  const uploadsPlaylist = channelId.replace(/^UC/, 'UU');
  const latestSrc = `https://www.youtube.com/embed?listType=playlist&list=${uploadsPlaylist}&rel=0&modestbranding=1`;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 shrink-0" />
        <p className="text-sm font-semibold text-slate-600">Nu se transmite live în acest moment</p>
      </div>
      <div className="aspect-video overflow-hidden rounded-3xl bg-slate-950">
        <iframe
          className="h-full w-full"
          src={latestSrc}
          title="Ultimul program"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
