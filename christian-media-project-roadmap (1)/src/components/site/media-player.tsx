"use client";

import { useState } from "react";
import { Play, Headphones, ExternalLink } from "lucide-react";

export default function MediaPlayer({
  kind,
  src,
  poster,
  title,
  duration,
}: {
  kind: "youtube" | "audio";
  src: string;
  poster?: string | null;
  title: string;
  duration?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (kind === "youtube") {
    return (
      <div>
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-brand-950 shadow-[var(--shadow-lift)]">
          {loaded ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${src}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button type="button" onClick={() => setLoaded(true)} className="group absolute inset-0 h-full w-full text-left" aria-label={`Lire la vidéo : ${title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {poster && <img src={poster} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-70" />}
              <span className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-flame-500 text-brand-950 shadow-2xl transition-transform duration-300 group-hover:scale-110">
                  <Play className="ml-1 h-8 w-8" fill="currentColor" aria-hidden="true" />
                </span>
              </span>
              <span className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-white">Cliquer pour charger le lecteur{duration ? ` · ${duration}` : ""}</span>
                <span className="rounded-full bg-brand-950/70 px-3 py-1 text-[11px] font-bold text-brand-100 backdrop-blur">YouTube · sans lecture auto</span>
              </span>
            </button>
          )}
        </div>
        <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500">
          <span>Le lecteur n'est chargé qu'à votre demande, via youtube-nocookie.com.</span>
          <a href={`https://www.youtube.com/watch?v=${src}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline">
            Voir sur YouTube <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-brand-950 p-6 shadow-[var(--shadow-lift)] sm:p-8">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-flame-500 text-brand-950">
          <Headphones className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.2em] text-flame-400 uppercase">Épisode audio{duration ? ` · ${duration}` : ""}</p>
          <p className="truncate font-display text-sm font-bold text-white">{title}</p>
        </div>
      </div>
      <div className="mt-5">
        {loaded ? (
          <audio controls autoPlay src={src} className="w-full" aria-label={title}>
            Votre navigateur ne prend pas en charge la lecture audio.
          </audio>
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="inline-flex items-center gap-2 rounded-full bg-flame-500 px-6 py-3 text-sm font-bold text-brand-950 transition hover:bg-flame-400"
          >
            <Play className="h-4 w-4" fill="currentColor" aria-hidden="true" /> Écouter l'épisode
          </button>
        )}
      </div>
      <p className="mt-4 text-xs text-brand-300">Lecture à la demande — rien ne démarre sans votre clic.</p>
    </div>
  );
}