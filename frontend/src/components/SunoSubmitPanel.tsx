"use client";

import { useState } from "react";
import { Music, Loader2, AlertCircle, Play } from "lucide-react";
import type { SunoTrack } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  lyrics: string;
  style: string;
  title: string;
}

export default function SunoSubmitPanel({ lyrics, style, title }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "polling" | "completed" | "failed">("idle");
  const [tracks, setTracks] = useState<SunoTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setStatus("submitting");
    setError(null);
    setTracks([]);

    try {
      const submitRes = await fetch(`${API_BASE}/api/submit-to-suno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song_id: "", lyrics, style, title }),
      });

      const result = await submitRes.json();

      if (!submitRes.ok || !result.success) {
        setStatus("failed");
        setError(result.error || "Submission failed");
        return;
      }

      setTracks(result.tracks || []);
      setTaskId(result.task_id || null);
      setStatus("completed");
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = status === "submitting" || status === "polling";

  return (
    <div className="space-y-4">
      <button
        onClick={handleSubmit}
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-himachali-river to-himachali-pine text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isBusy ? (
          <><Loader2 size={18} className="animate-spin" /> Submitting to Suno...</>
        ) : (
          <><Music size={18} /> Generate Audio with Suno</>
        )}
      </button>

      {status === "failed" && error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {status === "completed" && tracks.length > 0 && (
        <div className="space-y-3 p-4 rounded-lg bg-white border border-himachali-wool">
          <h3 className="text-sm font-semibold text-himachali-pine flex items-center gap-2">
            <Play size={14} />
            Generated Audio
          </h3>
          {tracks.map((track, i) => (
            <div key={track.id || i} className="space-y-1.5">
              {track.title && (
                <p className="text-sm font-medium text-himachali-earth">{track.title}</p>
              )}
              {track.audio_url && (
                <audio
                  controls
                  className="w-full h-10 rounded-lg"
                  src={track.audio_url}
                >
                  Your browser does not support the audio element.
                </audio>
              )}
              {track.image_url && (
                <img
                  src={track.image_url}
                  alt={track.title || "Album art"}
                  className="w-full max-w-xs rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
