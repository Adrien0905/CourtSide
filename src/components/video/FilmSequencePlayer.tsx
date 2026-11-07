import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { VideoTimestamp } from '../../types/scouting';
import {
  collectClipMarkers,
  extractYouTubeId,
  splitTimestampTokens,
  summaryDescription,
  youtubeWatchUrl,
} from '../../lib/videoTime';

interface YouTubePlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          width?: string;
          height?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
          };
        }
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.getElementById('youtube-iframe-api')) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

function ClickableScoutNote({
  text,
  onSeek,
}: {
  text: string;
  onSeek: (seconds: number) => void;
}) {
  return (
    <span>
      {splitTimestampTokens(text).map((part, index) =>
        part.seconds == null ? (
          <span key={index}>{part.text}</span>
        ) : (
          <button
            key={index}
            type="button"
            onClick={() => onSeek(part.seconds as number)}
            className="font-mono font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/40 underline-offset-2"
            title={`Aller à ${part.text}`}
          >
            {part.text}
          </button>
        )
      )}
    </span>
  );
}

interface FilmSequencePlayerProps {
  videoUrl: string;
  description?: string;
  timestamps: VideoTimestamp[];
  heading?: string;
}

export const FilmSequencePlayer: React.FC<FilmSequencePlayerProps> = ({
  videoUrl,
  description,
  timestamps,
  heading = 'Interactive Possession Timestamps',
}) => {
  const videoId = extractYouTubeId(videoUrl);
  const markers = collectClipMarkers({ timestamps, description });
  const summary = summaryDescription(description || '');
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const pendingSeek = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!videoId || !host) return;
    let cancelled = false;
    let player: YouTubePlayer | null = null;
    setPlayerReady(false);
    setPlayerError(false);
    host.replaceChildren();
    const mount = document.createElement('div');
    mount.className = 'h-full w-full';
    host.appendChild(mount);

    loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !window.YT?.Player) return;
        player = new window.YT.Player(mount, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              playerRef.current = event.target;
              setPlayerReady(true);
              if (pendingSeek.current != null) {
                event.target.seekTo(pendingSeek.current, true);
                event.target.playVideo();
                pendingSeek.current = null;
              }
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setPlayerError(true);
      });

    return () => {
      cancelled = true;
      playerRef.current = null;
      setPlayerReady(false);
      try {
        player?.destroy();
      } catch {
        // The iframe node may already have been removed with the card.
      }
      host.replaceChildren();
    };
  }, [videoId]);

  const seekTo = (seconds: number, index?: number) => {
    if (index != null) setActiveIndex(index);
    if (!videoId) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const player = playerRef.current;
    if (player && playerReady) {
      player.seekTo(seconds, true);
      player.playVideo();
      return;
    }
    pendingSeek.current = seconds;
  };

  return (
    <div className="space-y-3">
      {videoId && !playerError ? (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-[#1E293B] bg-black">
          <div ref={hostRef} className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full" />
        </div>
      ) : (
        <div className="rounded-lg border border-[#1E293B] bg-[#0C1220] px-4 py-5 text-sm text-slate-300">
          <p>
            Le lecteur intégré suit les liens YouTube. Cette séquence s&apos;ouvre dans un nouvel onglet.
          </p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
          >
            <span>Ouvrir la vidéo</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {summary && (
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          <ClickableScoutNote text={summary} onSeek={(seconds) => seekTo(seconds)} />
        </p>
      )}

      {markers.length > 0 && (
        <div className="rounded-lg border border-[#202E4A] bg-[#131C2D] p-3 space-y-2">
          <div className="text-sm uppercase font-bold tracking-wider text-slate-400">
            {heading}
          </div>
          <ul className="space-y-1.5">
            {markers.map((marker, index) => {
              const active = activeIndex === index;
              return (
                <li
                  key={`${marker.label}-${marker.seconds}-${index}`}
                  className={`flex items-start gap-2.5 text-sm rounded px-1.5 py-1 ${
                    active ? 'bg-amber-400/10' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => seekTo(marker.seconds, index)}
                    className="font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 hover:bg-amber-400/20 shrink-0"
                    title={
                      videoId
                        ? `Lire à ${marker.label}`
                        : 'Ouvrir la vidéo'
                    }
                  >
                    {marker.label}
                  </button>
                  <span className="text-slate-300 leading-snug">
                    <ClickableScoutNote text={marker.note} onSeek={(seconds) => seekTo(seconds)} />
                  </span>
                  {videoId && (
                    <a
                      href={youtubeWatchUrl(videoId, marker.seconds)}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-slate-500 hover:text-amber-300 shrink-0"
                      title="Ouvrir cet instant sur YouTube"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
