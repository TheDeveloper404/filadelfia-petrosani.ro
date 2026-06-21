// Vercel Edge Function — YouTube live detection
// Cost: 2 units/request (playlistItems.list + videos.list)
// Cache: 30s at Vercel edge
// runtime: 'edge' e OBLIGATORIU — handler-ul întoarce un Response (stil Fetch API);
// fără el rulează pe Node și atârnă până la timeout (504).

export const config = { runtime: 'edge' };

const API_KEY = process.env.YOUTUBE_API_KEY ?? '';
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID ?? 'UCgD-Qqh0_gQnBluzEEuPddw';
const UPLOADS_PLAYLIST_ID = 'UU' + CHANNEL_ID.slice(2);

interface LiveStatusResponse {
  isLive: boolean;
  videoId: string | null;
  title: string | null;
}

const FALLBACK: LiveStatusResponse = { isLive: false, videoId: null, title: null };

export default async function handler(): Promise<Response> {
  try {
    if (!API_KEY) {
      console.error('[live-status] YOUTUBE_API_KEY not set');
      return json(FALLBACK);
    }

    // Call 1: get latest video IDs from uploads playlist (1 unit)
    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=5&key=${API_KEY}`,
    );
    if (!plRes.ok) {
      console.error('[live-status] playlistItems error', plRes.status);
      return json(FALLBACK);
    }
    const pl = await plRes.json();
    const ids: string[] = (pl.items ?? []).map(
      (i: { contentDetails: { videoId: string } }) => i.contentDetails.videoId,
    );
    if (!ids.length) return json(FALLBACK);

    // Call 2: check live status of those videos (1 unit)
    const vidRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${ids.join(',')}&key=${API_KEY}`,
    );
    if (!vidRes.ok) {
      console.error('[live-status] videos error', vidRes.status);
      return json(FALLBACK);
    }
    const vid = await vidRes.json();

    // Only check liveBroadcastContent — simplest and most reliable signal
    const liveVideo = (vid.items ?? []).find(
      (v: { snippet: { liveBroadcastContent: string } }) =>
        v.snippet.liveBroadcastContent === 'live',
    );

    if (liveVideo) {
      return json({ isLive: true, videoId: liveVideo.id, title: liveVideo.snippet.title });
    }
    return json(FALLBACK);

  } catch (err) {
    console.error('[live-status] unexpected error', err);
    return json(FALLBACK);
  }
}

function json(data: LiveStatusResponse): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      // 30s cache — balances freshness vs quota usage
      'Cache-Control': 's-maxage=30, stale-while-revalidate=30',
    },
  });
}
